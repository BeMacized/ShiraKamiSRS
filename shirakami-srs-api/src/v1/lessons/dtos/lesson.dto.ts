import { CardDto } from '../../sets/cards/dtos/card.dto';
import { ReviewMode } from '../../reviews/dtos/review.dto';

export class LessonSetDto {
  cards: CardDto[];
  lessons: LessonDto[];
}

export class LessonDto {
  cardId: string;
  mode: ReviewMode;
}
