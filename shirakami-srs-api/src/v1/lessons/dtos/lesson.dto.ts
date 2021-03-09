import { CardDto } from '../../sets/cards/dtos/card.dto';
import { ReviewMode } from '../../reviews/dtos/review.dto';
import { SetDto } from '../../sets/dtos/set.dto';

export class LessonSetDto {
  total: number;
  sets: SetDto[];
  cards: CardDto[];
  lessons: LessonDto[];
}

export class LessonDto {
  cardId: string;
  mode: ReviewMode;
}
