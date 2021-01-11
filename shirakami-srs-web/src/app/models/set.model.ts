import { CardDto, CardEntity } from './card.model';

export type SetMode = 'enToJp' | 'jpToEn' | 'kanjiToKana';

export class SetSrsStatusEntity {
    public readonly lessons: number;
    public readonly reviews: number;
    public readonly levelItems: Readonly<{ [level: number]: number }>;

    static fromDto(dto: SetSrsStatusDto): SetSrsStatusEntity {
        return Object.assign(new SetEntity(), {
            lessons: dto.lessons,
            reviews: dto.reviews,
            levelItems: dto.levelItems,
        });
    }
}

export class SetEntity {
    public readonly id: string;
    public readonly name: string;
    public readonly modes: SetMode[];
    public readonly userId: string;
    public readonly cards?: CardEntity[];
    public readonly srsStatus?: SetSrsStatusEntity;

    static fromDto(dto: SetDto): SetEntity {
        return Object.assign(new SetEntity(), {
            id: dto.id,
            userId: dto.userId,
            name: dto.name,
            modes: dto.modes,
            cards: dto.cards?.map((card) => CardEntity.fromDto(card)),
            srsStatus: SetSrsStatusEntity.fromDto(dto.srsStatus)
        });
    }
}

export class SetSrsStatusDto {
    lessons: number;
    reviews: number;
    levelItems: Readonly<{ [level: number]: number }>;
}

export class CreateSetDto {
    name: string;
    modes: SetMode[];
}

export class UpdateSetDto extends CreateSetDto {
    id: string;
    userId: string;
}

export class SetDto extends UpdateSetDto {
    cards?: CardDto[];
    srsStatus?: SetSrsStatusDto;
}
