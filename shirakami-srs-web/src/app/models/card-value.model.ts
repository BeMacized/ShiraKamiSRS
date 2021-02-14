import {ReviewMode} from './review.model';

export class CardValueEntity {
    public readonly enTranslations: string[];
    public readonly jpTranslations: string[];
    public readonly supportedModes: ReviewMode[];

    static fromDto(dto: CardValueDto): CardValueEntity {
        return Object.assign(new CardValueEntity(), {
            enTranslations: dto.enTranslations,
            jpTranslations: dto.jpTranslations,
            supportedModes: dto.supportedModes,
        });
    }
}

export class CardValueDto {
    enTranslations: string[];
    jpTranslations: string[][];
    supportedModes: ReviewMode[];
}
