import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from 'nest-router';
import { SetsModule } from './sets/sets.module';
import { CardsModule } from './sets/cards/cards.module';
import { APP_ROUTES } from './routes';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetEntity } from './sets/entities/set.entity';
import { CardEntity } from './sets/cards/entities/card.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './sqlite.db',
      entities: [SetEntity, CardEntity],
      synchronize: true,
      logging: true,
    }),
    RouterModule.forRoutes(APP_ROUTES),
    SetsModule,
    CardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
