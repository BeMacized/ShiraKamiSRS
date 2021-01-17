import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { SetEntity } from '../sets/entities/set.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetEntity, CardEntity])],
  providers: [LessonsService],
  controllers: [LessonsController],
})
export class LessonsModule {}
