import { SrsLevelDto, SrsLevelEntity } from './srs-level.model';
import { CardValueDto, CardValueEntity } from './card-value.model';
import { ReviewDto, ReviewEntity } from './review.model';

export class CardEntity {
    public readonly id: string;
    public readonly setId: string;
    public readonly value: CardValueEntity;
    public readonly reviews: ReviewEntity[];

    static fromDto(dto: CardDto): CardEntity {
        return Object.assign(new CardEntity(), {
            id: dto.id,
            setId: dto.setId,
            value: CardValueEntity.fromDto(dto.value),
            reviews:
                dto.reviews?.map((review) => ReviewEntity.fromDto(review)) ||
                undefined,
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
    reviews: ReviewDto[];
}
