export type ReviewMode = 'enToJp' | 'jpToEn' | 'kanjiToKana';

export const ReviewModes: Readonly<ReviewMode[]> = [
    'enToJp',
    'jpToEn',
    'kanjiToKana',
];

export class ReviewEntity {
    id: string;
    cardId: string;
    mode: ReviewMode;
    creationDate: Date;
    reviewDate: Date;
    currentLevel: number;

    static fromDto(dto: ReviewDto): ReviewEntity {
        return Object.assign(new ReviewEntity(), {
            id: dto.id,
            cardId: dto.cardId,
            mode: dto.mode,
            creationDate: new Date(dto.creationDate * 1000),
            reviewDate: new Date(dto.reviewDate * 1000),
            currentLevel: dto.currentLevel,
        });
    }
}

export class ReviewDto {
    id: string;
    cardId: string;
    mode: ReviewMode;
    creationDate: number;
    reviewDate: number;
    currentLevel: number;
}
