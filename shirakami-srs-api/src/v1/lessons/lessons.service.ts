import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { Repository } from 'typeorm';
import { LessonDto, LessonSetDto } from './dtos/lesson.dto';
import { SetEntity } from '../sets/entities/set.entity';
import { CardDto } from '../sets/cards/dtos/card.dto';
import { ReviewEntity } from '../reviews/entities/review.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(SetEntity)
    private setRepository: Repository<SetEntity>,
  ) {}

  async fetchLessons(
    userId: string,
    setId?: string,
    limit?: number,
  ): Promise<LessonSetDto> {
    const lessonQuery = `
SELECT ce.id cardId, setModes.mode mode
FROM card_entity ce
         LEFT JOIN (
    SELECT *
    FROM (
             SELECT se.id setId, IF(se.modes LIKE '%enToJp%', 'enToJp', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.id = ?' : ''}
             UNION ALL
             SELECT se.id setId, IF(se.modes LIKE '%jpToEn%', 'jpToEn', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.id = ?' : ''}
             UNION ALL
             SELECT se.id setId, IF(se.modes LIKE '%kanjiToKana%', 'kanjiToKana', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.id = ?' : ''}
         ) as setModesRaw
    WHERE mode IS NOT NULL
) setModes ON setModes.setId = ce.setId
WHERE ce.id NOT IN (
    SELECT cardId
    FROM review_entity
    WHERE cardId = ce.id
      AND mode = setModes.mode
)
AND (setModes.mode <> 'kanjiToKana' OR ce.valueSupportedmodes LIKE '%kanjiToKana%')
${setId ? 'AND setModes.setId = ?' : ''}
ORDER BY ce.id DESC
${limit ? `LIMIT ?` : ``}     
    `;
    const lessonParameters: any[] = [userId];
    if (setId) lessonParameters.push(setId);
    lessonParameters.push(...lessonParameters, ...lessonParameters);
    if (setId) lessonParameters.push(setId);
    // TODO: FIND OUT HOW TO OPTIMIZE QUERY TO LIMIT DISTINCT VALUES INSTEAD OF FILTERING LATER.
    if (limit) lessonParameters.push(limit * 3);

    // Fetch lessons
    let lessons: Array<LessonDto> = await this.cardRepository.query(
      lessonQuery,
      lessonParameters,
    );

    // TODO: FIND OUT HOW TO OPTIMIZE QUERY TO LIMIT DISTINCT VALUES INSTEAD OF FILTERING LATER.
    if (limit) {
      lessons = lessons.reduce(
        (acc, lesson) => {
          const includes = acc.cardIds.includes(lesson.cardId);
          if (acc.cardIds.length === limit && !includes) return acc;
          if (!includes) acc.cardIds.push(lesson.cardId);
          acc.lessons.push(lesson);
          return acc;
        },
        { cardIds: [], lessons: [] } as {
          cardIds: string[];
          lessons: LessonDto[];
        },
      ).lessons;
    }

    // Get cards for all lessons
    const cards: CardDto[] = await this.cardRepository
      .createQueryBuilder('card')
      .where('card.id IN (:...cardIds)', {
        cardIds: lessons.map((l) => l.cardId),
      })
      .getMany()
      .then((entities) => entities.map((entity) => CardDto.fromEntity(entity)));

    // Find out total amount of lessons
    const countQuery = `
SELECT COUNT(*) as total
FROM card_entity ce
         LEFT JOIN (
    SELECT *
    FROM (
             SELECT se.id setId, IF(se.modes LIKE '%enToJp%', 'enToJp', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.id = ?' : ''}
             UNION ALL
             SELECT se.id setId, IF(se.modes LIKE '%jpToEn%', 'jpToEn', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.id = ?' : ''}
             UNION ALL
             SELECT se.id setId, IF(se.modes LIKE '%kanjiToKana%', 'kanjiToKana', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.id = ?' : ''}
         ) as setModesRaw
    WHERE mode IS NOT NULL
) setModes ON setModes.setId = ce.setId
WHERE ce.id NOT IN (
    SELECT cardId
    FROM review_entity
    WHERE cardId = ce.id
      AND mode = setModes.mode
)
AND (setModes.mode <> 'kanjiToKana' OR ce.valueSupportedmodes LIKE '%kanjiToKana%')
${setId ? 'AND setModes.setId = ?' : ''}
`;
    const countParameters = [...lessonParameters].slice(
      0,
      lessonParameters.length - (limit ? 1 : 0),
    );
    const total = (
      await this.cardRepository.query(countQuery, countParameters)
    )[0].total;

    return {
      total,
      cards,
      lessons,
    };
  }
}
