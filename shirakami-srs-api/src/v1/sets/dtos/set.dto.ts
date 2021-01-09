import {
  ArrayMinSize,
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from 'class-validator';
import { SetEntity, SetMode } from '../entities/set.entity';
import { CardDto } from '../cards/dtos/card.dto';

export class CreateOrUpdateSetDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  public readonly name: string;

  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(['enToJp', 'jpToEn', 'kanjiToKana'], { each: true })
  public readonly modes: SetMode[];
}

export class SetDto extends CreateOrUpdateSetDto {
  @IsNotEmpty()
  @IsUUID()
  public readonly id: string;

  public readonly cards?: CardDto[];

  static fromEntity(entity: SetEntity): SetDto {
    return {
      id: entity.id,
      name: entity.name,
      cards: entity.cards ? entity.cards.map(CardDto.fromEntity) : undefined,
      modes: entity.modes,
    };
  }
}
