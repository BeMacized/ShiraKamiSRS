import { CardDto, CardEntity } from './card.model';
import { ReviewMode } from './review.model';
import { CardValueDto } from './card-value.model';

//
// Entities
//

export class LessonEntity {
    card: CardEntity;
    mode: ReviewMode;

    static fromDto(lesson: LessonDto, cards: CardDto[]): LessonEntity {
        return Object.assign(new LessonEntity(), {
            card: cards.find((c) => c.id === lesson.cardId),
            mode: lesson.mode,
        });
    }
}

//
// DTOS
//

export class LessonSetDto {
    total: number;
    cards: CardDto[];
    lessons: LessonDto[];
}

export class LessonDto {
    cardId: string;
    mode: ReviewMode;
}
