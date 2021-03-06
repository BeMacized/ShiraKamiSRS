import {
  ArrayMinSize,
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { SetEntity, SetSrsStatus } from '../entities/set.entity';
import { CardDto } from '../cards/dtos/card.dto';
import { ReviewMode } from '../../reviews/dtos/review.dto';

export class CreateOrUpdateSetDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  public readonly name: string;

  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(['enToJp', 'jpToEn', 'kanjiToKana'], { each: true })
  public readonly modes: ReviewMode[];
}

export class SetDto extends CreateOrUpdateSetDto {
  @IsNotEmpty()
  @IsUUID()
  public readonly id: string;

  public readonly cards?: CardDto[];

  @ValidateNested()
  public readonly srsStatus: SetSrsStatus;

  @IsNumber()
  public readonly createdAt: number;

  static fromEntity(entity: SetEntity): SetDto {
    if (!entity) return null;
    return {
      id: entity.id,
      name: entity.name,
      cards: entity.cards ? entity.cards.map(CardDto.fromEntity) : undefined,
      modes: entity.modes,
      srsStatus: entity.srsStatus,
      createdAt: Math.floor(entity.createdAt.getTime() / 1000),
    };
  }
}
