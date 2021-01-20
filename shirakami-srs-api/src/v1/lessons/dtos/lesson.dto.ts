import { CardDto } from '../../sets/cards/dtos/card.dto';
import { ReviewMode } from '../../reviews/dtos/review.dto';

export class LessonSetDto {
  total: number;
  cards: CardDto[];
  lessons: LessonDto[];
}

export class LessonDto {
  cardId: string;
  mode: ReviewMode;
}
