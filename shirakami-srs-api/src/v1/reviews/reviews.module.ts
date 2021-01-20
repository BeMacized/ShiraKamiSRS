import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { ReviewEntity } from './entities/review.entity';
import { CardsModule } from '../sets/cards/cards.module';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity, ReviewEntity]), CardsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
