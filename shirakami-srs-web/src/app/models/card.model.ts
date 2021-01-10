import { SrsLevelDto, SrsLevelEntity } from './srs-level.model';
import { CardValueDto, CardValueEntity } from './card-value.model';

export class CardEntity {
    public readonly id: string;
    public readonly setId: string;
    public readonly value: CardValueEntity;
    public readonly srsLevelEnToJp: SrsLevelEntity;
    public readonly srsLevelJpToEn: SrsLevelEntity;
    public readonly srsLevelKanjiToKana: SrsLevelEntity;

    static fromDto(dto: CardDto): CardEntity {
        return Object.assign(new CardEntity(), {
            id: dto.id,
            setId: dto.setId,
            value: CardValueEntity.fromDto(dto.value),
            srsLevelEnToJp: SrsLevelEntity.fromDto(dto.srsLevelEnToJp),
            srsLevelJpToEn: SrsLevelEntity.fromDto(dto.srsLevelJpToEn),
            srsLevelKanjiToKana: SrsLevelEntity.fromDto(
                dto.srsLevelKanjiToKana
            ),
        });
    }
}

export class CreateCardDto {
    setId: string;
    value: CardValueDto;
}

export class UpdateCardDto extends CreateCardDto {
    id: string;
}

export class CardDto extends UpdateCardDto {
    srsLevelEnToJp: SrsLevelDto;
    srsLevelJpToEn: SrsLevelDto;
    srsLevelKanjiToKana: SrsLevelDto;
}
