import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { Repository } from 'typeorm';
import { LessonDto, LessonSetDto } from './dtos/lesson.dto';
import { SetEntity } from '../sets/entities/set.entity';
import { flatten } from 'lodash';
import { CardDto } from '../sets/cards/dtos/card.dto';
import { ReviewMode, ReviewModes } from '../reviews/dtos/review.dto';
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
             SELECT se.id setId, IIF(se.modes LIKE '%enToJp%', 'enToJp', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.setId = ?' : ''}
             UNION ALL
             SELECT se.id setId, IIF(se.modes LIKE '%jpToEn%', 'jpToEn', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.setId = ?' : ''}
             UNION ALL
             SELECT se.id setId, IIF(se.modes LIKE '%kanjiToKana%', 'kanjiToKana', null) mode
             FROM set_entity se
             WHERE se.userId = ?
               ${setId ? 'AND se.setId = ?' : ''}
         )
    WHERE mode IS NOT NULL
) setModes ON setModes.setId = ce.setId
WHERE cardId NOT IN (
    SELECT cardId
    FROM review_entity
    WHERE cardId = ce.id
      AND mode = setModes.mode
)
${limit ? `LIMIT ?` : ``}     
    `;
    const lessonParameters: any[] = [userId];
    if (setId) lessonParameters.push(setId);
    lessonParameters.push(...lessonParameters, ...lessonParameters);
    if (limit) lessonParameters.push(limit);
    console.log('PARAMETERS', lessonParameters);
    const lessons: Array<LessonDto> = await this.cardRepository.query(
      lessonQuery,
      lessonParameters,
    );

    const cards: CardDto[] = await this.cardRepository
      .createQueryBuilder('card')
      .where('card.id IN (:...cardIds)', {
        cardIds: lessons.map((l) => l.cardId),
      })
      .getMany()
      .then((entities) => entities.map((entity) => CardDto.fromEntity(entity)));

    return {
      cards,
      lessons,
    };
  }
}
