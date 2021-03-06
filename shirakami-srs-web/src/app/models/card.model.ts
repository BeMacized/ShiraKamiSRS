import {
    CardValueDto,
    CardValueEntity,
    CreateOrUpdateCardValueDto,
} from './card-value.model';
import { ReviewDto, ReviewEntity } from './review.model';
import { SetEntity } from './set.model';

export class CardEntity {
    public readonly id: string;
    public readonly setId: string;
    public readonly value: CardValueEntity;
    public readonly reviews: ReviewEntity[];
    public set?: SetEntity;

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
    value: CreateOrUpdateCardValueDto;
}

export class UpdateCardDto extends CreateCardDto {
    id: string;
}

export class CardDto extends UpdateCardDto {
    reviews: ReviewDto[];
    value: CardValueDto;
}
