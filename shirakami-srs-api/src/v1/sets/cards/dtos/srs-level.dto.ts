import { SrsLevel } from '../entities/card.entity';

export class SrsLevelDto {
  level: number;

  lastUpdated: number;

  static fromSrsLevel(data: SrsLevel): SrsLevelDto {
    if (!data) return null;
    return {
      level: data.level,
      lastUpdated: Math.floor(data.lastChanged.getTime() / 1000),
    };
  }
}
