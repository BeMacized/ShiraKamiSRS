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
    if (!entity) return undefined;
    return {
      id: entity.id,
      setId: entity.setId,
      value: entity.value,
      srsLevelEnToJp:
        SrsLevelDto.fromSrsLevel(entity.srsLevelEnToJp) || undefined,
      srsLevelJpToEn:
        SrsLevelDto.fromSrsLevel(entity.srsLevelJpToEn) || undefined,
      srsLevelKanjiToKana:
        SrsLevelDto.fromSrsLevel(entity.srsLevelKanjiToKana) || undefined,
    };
  }
}
