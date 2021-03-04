import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../users/entities/user.entity';
import { AccessTokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  public constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: configService.get<number>('JWT_ACCESS_EXPIRY'),
      },
    });
  }

  async validate(payload: AccessTokenPayload): Promise<UserEntity> {
    const { type, userId } = payload;
    if (type !== 'ACCESS' || !userId) return null;
    try {
      return await this.usersService.findById(userId);
    } catch (e) {
      if (e instanceof NotFoundException) return null;
      throw e;
    }
  }
}
