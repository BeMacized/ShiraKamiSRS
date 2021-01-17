import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { SetEntity } from '../sets/entities/set.entity';
import { ReviewEntity } from '../reviews/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetEntity, CardEntity, ReviewEntity])],
  providers: [LessonsService],
  controllers: [LessonsController],
})
export class LessonsModule {}
