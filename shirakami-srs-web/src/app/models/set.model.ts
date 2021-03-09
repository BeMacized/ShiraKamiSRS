import { CardDto, CardEntity } from './card.model';
import { ReviewMode } from './review.model';

//
// ENTITIES
//

export class SetEntity {
    public readonly id: string;
    public readonly name: string;
    public readonly modes: ReviewMode[];
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
            srsStatus: dto.srsStatus
                ? SetSrsStatusEntity.fromDto(dto.srsStatus)
                : null,
        });
    }
}

export class SetSrsStatusEntity {
    public readonly lessons: number;
    public readonly levelItems: Readonly<{ [level: number]: number }>;
    public readonly reviews: number;

    static fromDto(dto: SetSrsStatusDto): SetSrsStatusEntity {
        return Object.assign(new SetEntity(), {
            lessons: dto.lessons,
            reviews: dto.reviews,
            levelItems: dto.levelItems,
        });
    }
}

//
// DTOS
//

export class CreateSetDto {
    name: string;
    modes: ReviewMode[];
}

export class UpdateSetDto extends CreateSetDto {
    id: string;
    userId: string;
}

export class SetDto extends UpdateSetDto {
    cards?: CardDto[];
    srsStatus?: SetSrsStatusDto;
}

export class SetSrsStatusDto {
    lessons: number;
    reviews: number;
    levelItems: Readonly<{ [level: number]: number }>;
}
