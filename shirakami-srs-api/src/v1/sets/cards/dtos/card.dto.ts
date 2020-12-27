import { CardValueDto } from './card-value.dto';
import { IsNumber, IsUUID, ValidateNested } from 'class-validator';
import { CardEntity } from '../entities/card.entity';
import { Type } from 'class-transformer';
import { SrsLevelDto } from './srs-level.dto';

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
  @IsNumber()
  @ValidateNested()
  public readonly srsLevelEnToJp: SrsLevelDto;
  @IsNumber()
  @ValidateNested()
  public readonly srsLevelJpToEn: SrsLevelDto;
  @IsNumber()
  @ValidateNested()
  public readonly srsLevelKanjiToKana: SrsLevelDto;

  static fromEntity(entity: CardEntity): CardDto {
    return {
      id: entity.id,
      setId: entity.setId,
      value: entity.value,
      srsLevelEnToJp: SrsLevelDto.fromEntity(entity.srsLevelEnToJp),
      srsLevelJpToEn: SrsLevelDto.fromEntity(entity.srsLevelJpToEn),
      srsLevelKanjiToKana: SrsLevelDto.fromEntity(entity.srsLevelKanjiToKana),
    };
  }
}
