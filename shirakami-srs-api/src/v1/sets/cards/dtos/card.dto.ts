import { CardValueDTO } from './card-value.dto';
import { IsNotEmpty, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { CardEntity } from '../entities/card.entity';
import { Type } from 'class-transformer';

export class BaseCardDTO {
  @ValidateNested()
  @Type(() => CardValueDTO)
  public readonly value: CardValueDTO;
}

export class CardDTO extends BaseCardDTO {
  @IsUUID()
  public readonly id: string;
  @IsNumber()
  public readonly levelLastChanged?: number;
  @IsNumber()
  public readonly srsLevel?: number;
  @IsNotEmpty()
  @IsUUID()
  public readonly setId: string;

  static fromEntity(entity: CardEntity): CardDTO {
    return {
      id: entity.id,
      setId: entity.setId,
      value: entity.value,
      srsLevel: entity.srsLevel,
      levelLastChanged: Math.floor(entity.levelLastChanged.getTime() / 1000),
    };
  }
}
