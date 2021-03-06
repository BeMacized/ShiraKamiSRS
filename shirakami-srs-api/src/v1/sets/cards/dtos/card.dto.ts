import { CardValueDto, CreateOrUpdateCardValueDto } from './card-value.dto';
import { IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { CardEntity } from '../entities/card.entity';
import { Type } from 'class-transformer';
import { ReviewDto } from '../../../reviews/dtos/review.dto';
import { Column } from 'typeorm';

export class CreateOrUpdateCardDto {
  @ValidateNested()
  @Type(() => CreateOrUpdateCardValueDto)
  public readonly value: CreateOrUpdateCardValueDto;
}

export class CardDto extends CreateOrUpdateCardDto {
  @IsUUID()
  public readonly id: string;
  @IsUUID()
  public readonly setId: string;
  @ValidateNested({ each: true })
  @Type(() => ReviewDto)
  public readonly reviews: ReviewDto[];
  @ValidateNested()
  @Type(() => CardValueDto)
  public readonly value: CardValueDto;
  @IsNumber()
  @Min(0)
  sortIndex: number;
  @IsNumber()
  createdAt: number;

  static fromEntity(entity: CardEntity): CardDto {
    if (!entity) return null;
    return {
      id: entity.id,
      setId: entity.setId,
      value: entity.value,
      sortIndex: entity.sortIndex,
      createdAt: Math.floor(entity.createdAt.getTime() / 1000),
      reviews:
        entity.reviews?.map((review) => ReviewDto.fromEntity(review)) ||
        undefined,
    };
  }
}
