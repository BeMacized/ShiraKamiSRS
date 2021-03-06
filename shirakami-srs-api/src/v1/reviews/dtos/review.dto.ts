import { ReviewEntity } from '../entities/review.entity';
import { IsEnum, IsNumber, IsUUID } from 'class-validator';
import { CardDto } from '../../sets/cards/dtos/card.dto';
import { LessonDto } from '../../lessons/dtos/lesson.dto';
import { SetDto } from '../../sets/dtos/set.dto';

export type ReviewMode = 'enToJp' | 'jpToEn' | 'kanjiToKana';
export const ReviewModes: Readonly<ReviewMode[]> = [
  'enToJp',
  'jpToEn',
  'kanjiToKana',
];

export class ReviewSetDto {
  sets: SetDto[];
  cards: CardDto[];
  reviews: ReviewDto[];
}

export class ReviewDto {
  id: string;
  cardId: string;
  mode: ReviewMode;
  creationDate: number;
  reviewDate: number;
  currentLevel: number;

  static fromEntity(entity: ReviewEntity): ReviewDto {
    if (!entity) return null;
    return {
      id: entity.id,
      cardId: entity.cardId,
      mode: entity.mode,
      creationDate: Math.round(entity.creationDate.getTime() / 1000),
      reviewDate: Math.round(entity.reviewDate.getTime() / 1000),
      currentLevel: entity.currentLevel,
    };
  }
}

export class CreateReviewDto {
  @IsUUID()
  cardId: string;

  @IsEnum(['enToJp', 'jpToEn', 'kanjiToKana'])
  mode: ReviewMode;
}

export class SubmitReviewDto {
  @IsNumber()
  score: number;
}
