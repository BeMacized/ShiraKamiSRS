import { CardDto, CardEntity } from './card.model';
import { ReviewMode } from './review.model';
import { SetDto, SetEntity } from './set.model';

//
// Entities
//

export class LessonEntity {
    card: CardEntity;
    mode: ReviewMode;

    static fromDto(
        lesson: LessonDto,
        cards: CardDto[],
        sets: SetDto[]
    ): LessonEntity {
        const card = CardEntity.fromDto(
            cards.find((c) => c.id === lesson.cardId)
        );
        card.set = SetEntity.fromDto(sets.find((s) => s.id === card.setId));
        const mode = lesson.mode;
        return Object.assign(new LessonEntity(), { card, mode });
    }
}

//
// DTOS
//

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
