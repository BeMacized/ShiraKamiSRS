export type ReviewMode = 'enToJp' | 'jpToEn' | 'kanjiToKana';

export const ReviewModes: Readonly<ReviewMode[]> = [
    'enToJp',
    'jpToEn',
    'kanjiToKana',
];

export class ReviewEntity {
    setId: string;
    cardId: string;
    reviewTime: Date;
    mode: ReviewMode;
    srsLevel: number;

    static fromDto(dto: ReviewDto): ReviewEntity {
        return Object.assign(new ReviewEntity(), {
            setId: dto.setId,
            cardId: dto.cardId,
            mode: dto.mode,
            srsLevel: dto.srsLevel,
            reviewTime: new Date(dto.reviewTime * 1000),
        });
    }
}

export class ReviewDto {
    setId: string;
    cardId: string;
    reviewTime: number;
    mode: ReviewMode;
    srsLevel: number;
}
