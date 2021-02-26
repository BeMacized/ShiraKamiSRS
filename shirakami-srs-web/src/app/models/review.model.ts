import { CardDto, CardEntity } from './card.model';

export type ReviewMode = 'enToJp' | 'jpToEn' | 'kanjiToKana';

export const ReviewModes: Readonly<ReviewMode[]> = [
    'enToJp',
    'jpToEn',
    'kanjiToKana',
];

export class ReviewEntity {
    id: string;
    cardId: string;
    card?: CardEntity;
    mode: ReviewMode;
    creationDate: Date;
    reviewDate: Date;
    currentLevel: number;

    static fromDto(review: ReviewDto, cards?: CardDto[]): ReviewEntity {
        return Object.assign(new ReviewEntity(), {
            id: review.id,
            card: cards ? cards.find((c) => c.id === review.cardId) : null,
            cardId: review.cardId,
            mode: review.mode,
            creationDate: new Date(review.creationDate * 1000),
            reviewDate: new Date(review.reviewDate * 1000),
            currentLevel: review.currentLevel,
        });
    }
}

export class ReviewSetDto {
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
}
