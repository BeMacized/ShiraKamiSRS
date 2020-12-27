import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RouterModule } from 'nest-router';
import { APP_ROUTES } from './routes';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetEntity } from './v1/sets/entities/set.entity';
import { CardEntity } from './v1/sets/cards/entities/card.entity';
import { V1Module } from './v1/v1.module';
import { UserEntity } from './v1/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { RefreshTokenEntity } from './v1/authentication/entities/refresh-token.entity';
import { SrsLevelEntity } from './v1/sets/cards/entities/srs-level.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './sqlite.db',
      entities: [SetEntity, CardEntity, UserEntity, RefreshTokenEntity, SrsLevelEntity],
      synchronize: true,
      logging: true,
    }),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRY: Joi.number().default(60 * 60 * 24),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_REFRESH_EXPIRY: Joi.number().default(60 * 60 * 24 * 30),
      }),
    }),
    RouterModule.forRoutes(APP_ROUTES),
    V1Module,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
}
