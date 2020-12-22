import { CardValueDTO } from './card-value.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { CardEntity } from '../entities/card.entity';
import { Type } from 'class-transformer';

export class CreateCardDTO {
  @ValidateNested()
  @Type(() => CardValueDTO)
  public readonly value: CardValueDTO;
  @IsNumber()
  @IsOptional()
  public readonly levelLastChanged?: number;
  @IsNumber()
  @IsOptional()
  public readonly srsLevel?: number;
}

export class UpdateCardDTO extends CreateCardDTO {
  @IsUUID()
  public readonly id: string;
}

export class CardDTO extends UpdateCardDTO {
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
