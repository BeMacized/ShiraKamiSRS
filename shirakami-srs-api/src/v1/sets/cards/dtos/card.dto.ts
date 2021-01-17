import { CardValueDto } from './card-value.dto';
import { IsUUID, ValidateNested } from 'class-validator';
import { CardEntity } from '../entities/card.entity';
import { Type } from 'class-transformer';
import { ReviewDto } from '../../../reviews/dtos/review.dto';

export class CreateOrUpdateCardDto {
  @ValidateNested()
  @Type(() => CardValueDto)
  public readonly value: CardValueDto;
}

export class CardDto extends CreateOrUpdateCardDto {
  @IsUUID()
  public readonly id: string;
  @IsUUID()
  public readonly setId: string;
  @ValidateNested({ each: true })
  public readonly reviews: ReviewDto[];

  static fromEntity(entity: CardEntity): CardDto {
    if (!entity) return null;
    return {
      id: entity.id,
      setId: entity.setId,
      value: entity.value,
      reviews:
        entity.reviews?.map((review) => ReviewDto.fromEntity(review)) ||
        undefined,
    };
  }
}
