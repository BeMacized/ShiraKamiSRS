import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RouterModule } from 'nest-router';
import { APP_ROUTES } from './routes';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetEntity } from './v1/sets/entities/set.entity';
import { CardEntity } from './v1/sets/cards/entities/card.entity';
import { V1Module } from './v1/v1.module';
import { UserEntity } from './v1/users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { RefreshTokenEntity } from './v1/authentication/entities/refresh-token.entity';
import { ReviewEntity } from './v1/reviews/entities/review.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Security Settings
        JWT_SECRET: Joi.string().default('CHANGEME'),
        JWT_ACCESS_EXPIRY: Joi.number().default(60 * 60 * 24),
        JWT_REFRESH_EXPIRY: Joi.number().default(60 * 60 * 24 * 30),
        EMAIL_VERIFICATION: Joi.boolean().default(false),
        ENABLE_CORS: Joi.boolean().default(false),
        // Database Settings
        MYSQL_HOST: Joi.string().default('localhost'),
        MYSQL_PORT: Joi.number().default('3306'),
        MYSQL_USER: Joi.string().default('shirakami'),
        MYSQL_PASSWORD: Joi.string().default('shirakami'),
        MYSQL_DB: Joi.string().default('shirakami'),
        // SMTP Settings
        SMTP_FROM_ADDRESS: Joi.string().default(''),
        SMTP_FROM_NAME: Joi.string().default(''),
        SMTP_HOST: Joi.string().default(''),
        SMTP_USER: Joi.string().default(''),
        SMTP_PASSWORD: Joi.string().default(''),
        SMTP_PORT: Joi.number().default(587),
        SMTP_SECURE: Joi.boolean().default(false),
        // Application Settings
        APP_BASE_URL: Joi.string().default(''),
        APP_SERVE_HTTP: Joi.boolean().default(false),
        ENABLE_PASSWORD_RESETS: Joi.bool().default(false),
        // Development Settings
        TYPEORM_LOGGING: Joi.boolean().default(false),
        SMTP_SUPPRESS: Joi.boolean().default(false),
      }),
    }),
    ServeStaticModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get<boolean>('APP_SERVE_HTTP')
          ? [
              {
                rootPath: join(__dirname, 'web'),
              },
            ]
          : [],
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('MYSQL_HOST'),
        port: configService.get<number>('MYSQL_PORT'),
        username: configService.get<string>('MYSQL_USER'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DB'),
        entities: [
          SetEntity,
          CardEntity,
          UserEntity,
          RefreshTokenEntity,
          ReviewEntity,
        ],
        logging: configService.get<boolean>('TYPEORM_LOGGING'),
        synchronize: false,
        migrationsRun: true,
        migrations: [join(__dirname, 'migrations/*.js')],
      }),
    }),
    RouterModule.forRoutes(APP_ROUTES),
    ThrottlerModule.forRoot(),
    ScheduleModule.forRoot(),
    V1Module,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  constructor(private config: ConfigService) {
    if (config.get('JWT_SECRET') === 'CHANGEME')
      console.warn(
        'Environment variable JWT_SECRET has not yet been changed. Please set this environment variable to prevent unauthorized access.',
      );
  }
}
