import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import {
  AccessTokenPayload,
  EmailVerificationTokenPayload,
  PasswordResetTokenPayload,
  RefreshTokenPayload,
} from './interfaces/token-payload.interface';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TokensService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async runRefreshTokenCleanup() {
    const result = await this.refreshTokenRepository.delete({
      expiration: LessThan(new Date()),
    });
    if (result.affected)
      console.log(
        `Cleaned up ${result.affected} expired refresh ${
          result.affected === 1 ? 'token' : 'tokens'
        }`,
      );
  }

  public async generateAccessToken(user: UserEntity): Promise<string> {
    const payload: AccessTokenPayload = {
      type: 'ACCESS',
      userId: user.id,
    };
    return this.jwt.signAsync(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRY'),
    });
  }

  public async generateEmailVerificationToken(
    user: UserEntity,
  ): Promise<string> {
    const payload: EmailVerificationTokenPayload = {
      type: 'EMAIL_VERIFICATION',
      userId: user.id,
      email: user.email,
    };
    return this.jwt.signAsync(payload);
  }

  async generatePasswordResetToken(user: UserEntity) {
    const payload: PasswordResetTokenPayload = {
      type: 'PASSWORD_RESET',
      userId: user.id,
    };
    return this.jwt.signAsync(payload, {
      expiresIn: 60 * 60 * 24,
    });
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
            type: 'REFRESH',
            userId: user.id,
            jwtId: entity.id,
          };
          const token = await this.jwt.signAsync(payload, {
            expiresIn: ttl,
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
  ): Promise<{ accessToken: string; refreshToken: string }> {
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
      accessToken,
      refreshToken,
    };
  }

  private async resolveRefreshToken(
    encoded: string,
  ): Promise<RefreshTokenEntity> {
    const payload = await this.decodeToken<RefreshTokenPayload>(
      encoded,
      'Refresh',
    );
    return this.refreshTokenRepository.findOne(payload.jwtId);
  }

  public async decodeToken<T extends object = any>(
    token: string,
    name?: string,
  ): Promise<T> {
    try {
      return await this.jwt.verifyAsync<T>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException(
          `${name} token expired`.trim(),
          'TOKEN_EXPIRED',
        );
      } else if (e instanceof JsonWebTokenError) {
        let code;
        switch (e.message) {
          case 'jwt signature is required':
            code = 'MISSING_SIGNATURE';
            break;
          case 'invalid signature':
            code = 'INVALID_SIGNATURE';
            break;
          case 'invalid token':
          case 'jwt malformed':
          default:
            code = 'TOKEN_MALFORMED';
            break;
        }
        throw new UnprocessableEntityException(
          name
            ? `Invalid ${name} token: ${e.message}`
            : `Invalid token: ${e.message}`,
          code,
        );
      } else {
        throw new UnprocessableEntityException(
          `${name} token malformed`.trim(),
          'TOKEN_MALFORMED',
        );
      }
    }
  }
}
