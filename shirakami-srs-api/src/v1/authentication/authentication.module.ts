import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { TokensService } from './tokens.service';
import { JWTStrategy } from './strategies/jwt.strategy';
import { JWTGuard } from './guards/jwt.guard';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    UsersModule,
    PassportModule,
    ConfigModule,
    CommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  providers: [TokensService, JWTStrategy, JWTGuard],
  exports: [JWTGuard],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
