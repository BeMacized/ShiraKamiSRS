import { SrsLevelEntity } from '../entities/srs-level.entity';

export class SrsLevelDto {
  level: number;

  lastUpdated: number;

  static fromEntity(entity: SrsLevelEntity): SrsLevelDto {
    return {
      level: entity.level,
      lastUpdated: Math.floor(entity.lastChanged.getTime() / 1000),
    };
  }
}
