import { CardDto, CardEntity } from './card.model';

export type SetMode = 'enToJp' | 'jpToEn' | 'kanjiToKana';

export class SetEntity {
    public readonly id: string;
    public readonly name: string;
    public readonly modes: SetMode[];
    public readonly userId: string;
    public readonly cards?: CardEntity[];

    static fromDto(dto: SetDto): SetEntity {
        return Object.assign(new SetEntity(), {
            id: dto.id,
            userId: dto.userId,
            name: dto.name,
            modes: dto.modes,
            cards: dto.cards?.map((card) => CardEntity.fromDto(card)),
        });
    }
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
}
