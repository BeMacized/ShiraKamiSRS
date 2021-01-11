import { SrsLevel } from '../entities/card.entity';

export class SrsLevelDto {
  level: number;

  lastUpdated: number;

  static fromSrsLevel(data: SrsLevel): SrsLevelDto {
    return {
      level: data.level,
      lastUpdated: Math.floor(data.lastChanged.getTime() / 1000),
    };
  }
}
