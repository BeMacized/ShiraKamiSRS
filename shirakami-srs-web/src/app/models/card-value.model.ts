import {ReviewMode} from './review.model';

export class CardValueEntity {
    public readonly enTranslations: string[];
    public readonly jpTranslations: [string, string?][];
    public readonly supportedModes: ReviewMode[];
    public readonly enNote?: string;
    public readonly jpNote?: string;

    static fromDto(dto: CardValueDto): CardValueEntity {
        return Object.assign(new CardValueEntity(), {
            enTranslations: dto.enTranslations,
            jpTranslations: dto.jpTranslations,
            enNote: dto.enNote,
            jpNote: dto.jpNote,
            supportedModes: dto.supportedModes,
        });
    }
}

export class CreateOrUpdateCardValueDto {
    enTranslations: string[];
    jpTranslations: [string, string?][];
    enNote?: string;
    jpNote?: string;
}

export class CardValueDto extends CreateOrUpdateCardValueDto {
    supportedModes: ReviewMode[];
}
