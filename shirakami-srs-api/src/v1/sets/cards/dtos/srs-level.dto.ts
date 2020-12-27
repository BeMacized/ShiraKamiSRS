import { IsNotEmpty, IsNumber, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { CardEntity } from '../entities/card.entity';
import { SrsLevelEntity } from '../entities/srs-level.entity';

export class SrsLevelDto {
  @IsNumber()
  level: number;

  @IsNumber()
  lastUpdated: number;

  static fromEntity(entity: SrsLevelEntity): SrsLevelDto {
    return {
      level: entity.level,
      lastUpdated: Math.floor(entity.lastChanged.getTime() / 1000),
    }
  }
}
