import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { Repository } from 'typeorm';
import { LessonDto, LessonSetDto } from './dtos/lesson.dto';
import { SetEntity } from '../sets/entities/set.entity';
import { flatten } from 'lodash';
import { CardDto } from '../sets/cards/dtos/card.dto';
import { ReviewMode, ReviewModes } from '../reviews/dtos/review.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    @InjectRepository(SetEntity)
    private setRepository: Repository<SetEntity>,
  ) {}

  async fetchLessons(
    userId: string,
    setId?: string,
    limit?: number,
  ): Promise<LessonSetDto> {
    const query = `
SELECT c.id,
       c.setId,
       c.valueEnglish,
       c.valueKana,
       c.valueKanji,
       CASE
           WHEN s.modes LIKE '%enToJp%'
               AND c.srsLevelEnToJpLevel = -1
               THEN true
           ELSE false
           END enToJp,
       CASE
           WHEN s.modes LIKE '%jpToEn%'
               AND c.srsLevelJpToEnLevel = -1
               THEN true
           ELSE false
           END jpToEn,
       CASE
           WHEN s.modes LIKE '%kanjiToKana%'
               AND c.srsLevelKanjiToKanaLevel = -1
               AND c.valueKanji IS NOT NULL
               THEN true
           ELSE false
           END kanjiToKana

FROM card_entity c
         INNER JOIN set_entity s on c.setId = s.id

WHERE c.setId IN (
    SELECT id
    FROM set_entity
    WHERE userId = ?
    ${setId ? 'AND id = ?' : ''}
)   
AND (enToJp = true OR jpToEn = true OR kanjiToKana = true)
${limit ? 'LIMIT ?' : ''}
    `;
    const params: any[] = [userId];
    if (setId) params.push(setId);
    if (limit) params.push(limit);
    const cards: Array<
      CardEntity &
        {
          [reviewMode in ReviewMode]: boolean;
        }
    > = await this.cardRepository.query(query, params).then((rows) =>
      rows.map((row) => ({
        ...row,
        value: {
          english: row['valueEnglish'],
          kana: row['valueKana'],
          kanji: row['valueKanji'],
        },
      })),
    );

    return {
      lessons: flatten(
        cards.map((row) => {
          const rowLessons: LessonDto[] = [];
          for (const mode of ReviewModes) {
            if (row[mode]) rowLessons.push({ cardId: row.id, mode });
          }
          return rowLessons;
        }),
      ),
      cards: cards.map((row) => CardDto.fromEntity(row)),
    };
  }
}
