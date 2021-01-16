import { Injectable } from '@nestjs/common';
import { ReviewDto, ReviewMode, ReviewModes } from './dtos/review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import * as moment from 'moment';
import 'moment-round';
import { SrsLevel } from '../users/models/srs-settings';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
  ) {}

  public async getAvailableReviews(
    user: UserEntity,
    timespan = 3600,
  ): Promise<ReviewDto[]> {
    const endTime = moment().startOf('hour').unix() + timespan;

    const { query, parameters } = this.buildReviewableCardsQuery(
      user.id,
      user.srsSettings.levels,
      endTime,
    );

    const rows: Array<{
      mode: ReviewMode;
      cardId: string;
      setId: string;
      srsLevel: number;
      lastChanged: number;
    }> = await this.cardRepository.query(query, parameters);

    return rows
      .map((row) => ({
        ...row,
        reviewTime: moment
          .unix(
            row.lastChanged +
              user.srsSettings.levels.find((l) => l.id === row.srsLevel)
                .levelDuration,
          )
          .round(1, 'hour')
          .unix(),
      }))
      .filter((review) => review.reviewTime < endTime);
  }

  private buildReviewableCardsQuery(
    userId: string,
    srsLevels: SrsLevel[],
    endTime: number,
  ): { query: string; parameters: any[] } {
    // I know, this is disgusting. This should be optimized. Sometime. Maybe. In the future. It functions please don't judge me.
    const parameters: any[] = [];
    const query = ReviewModes.map((mode) => {
      const modePrefix = `srsLevel${mode
        .substring(0, 1)
        .toUpperCase()}${mode.substring(1)}`;
      parameters.push(mode);
      parameters.push(userId);
      parameters.push(`%${mode}%`);
      const srsConstraints = srsLevels.map((level, index) => {
        parameters.push(level.id);
        parameters.push(endTime - level.levelDuration);
        return `  (
    ${modePrefix}Level = ?
    AND ${modePrefix}Lastchanged < datetime(?, 'unixepoch')
  )`;
      });
      return `
SELECT ? as mode, id as cardId, setId, ${modePrefix}Level as srsLevel, CAST(strftime('%s', ${modePrefix}Lastchanged) AS INT) as lastChanged
FROM card_entity
WHERE setId IN (
    SELECT id
    FROM set_entity
    WHERE userId = ?
    AND modes LIKE ?
)
AND (\n${srsConstraints.join('\n  OR\n')}\n)
`;
    }).join('\nUNION ALL\n');
    return { query, parameters };
  }
}
