import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './interfaces/token-payload.interface';
import { TokenExpiredError } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  public async generateAccessToken(user: UserEntity): Promise<string> {
    const payload: AccessTokenPayload = {
      userId: user.id,
    };
    return this.jwt.signAsync(payload);
  }

  public async generateRefreshToken(user: UserEntity): Promise<string> {
    // Determine expiration date
    const expiration = new Date();
    const ttl = this.configService.get<number>('JWT_REFRESH_EXPIRY');
    expiration.setTime(expiration.getTime() + ttl * 1000);
    try {
      // Run in a transaction
      return await this.refreshTokenRepository.manager.transaction<string>(
        async (em) => {
          // Save entity in DB
          const entity: RefreshTokenEntity = await em.save(
            Object.assign(new RefreshTokenEntity(), {
              userId: user.id,
              token: '',
              expiration,
            }),
          );
          // Generate the token
          const payload: RefreshTokenPayload = {
            userId: user.id,
            jwtId: entity.id,
          };
          const token = await this.jwt.signAsync(payload, {
            expiresIn: ttl,
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          });
          // Update DB entity with generated token
          await em.save(Object.assign(entity, { token }));
          // Return the generated token
          return token;
        },
      );
    } catch (e) {
      Logger.error(e);
      throw new InternalServerErrorException(
        'Could not generate refresh token',
      );
    }
  }

  public async refreshTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const refreshTokenEntity = await this.resolveRefreshToken(refreshToken);
    // Check if token exists
    if (!refreshTokenEntity) {
      throw new UnprocessableEntityException('Refresh token not found');
    }
    // Check if token has been revoked
    if (refreshTokenEntity.revoked) {
      throw new UnprocessableEntityException('Refresh token revoked');
    }
    // Check if user exists
    const user = await this.userService.findById(refreshTokenEntity.userId);
    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }
    // Create new tokens
    accessToken = await this.generateAccessToken(user);
    refreshToken = await this.generateRefreshToken(user);
    // Delete old refresh token
    await this.refreshTokenRepository.delete(refreshTokenEntity.id);
    // Return new tokens
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  private async resolveRefreshToken(
    encoded: string,
  ): Promise<RefreshTokenEntity> {
    const payload = await this.decodeRefreshToken(encoded);
    return this.refreshTokenRepository.findOne(payload.jwtId);
  }

  private async decodeRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return this.jwt.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }
}
