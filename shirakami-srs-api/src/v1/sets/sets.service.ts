// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateOrUpdateSetEntity,
  SetEntity,
  SetSrsStatus,
} from './entities/set.entity';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { CreateOrUpdateSetDto } from './dtos/set.dto';

@Injectable()
export class SetsService {
  constructor(
    @InjectRepository(SetEntity)
    private setRepository: Repository<SetEntity>,
  ) {}

  /**
   * Finds all sets.
   * @param userId - The id of the user for which to look up the sets.
   */
  async findAll(userId: string): Promise<SetEntity[]> {
    const sets = await this.setRepository.find({ userId });
    const statuses = await this.getSrsStatus(userId);
    for (const set of sets) {
      set.srsStatus = statuses.find((status) => status.setId === set.id).status;
    }
    return sets;
  }

  /**
   * Find a specific set by its id.
   * @param id - The id of the set to find.
   * @param userId - The id of the user for which to look up the set. (Optional)
   * @param includeCards - Whether to include cards with the set. (Optional, Default: false)
   * @returns The found set.
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set does not belong to the specified user id.
   */
  async findOneById(
    id: string,
    userId?: string,
    includeCards = false,
  ): Promise<SetEntity> {
    const entity = await this.setRepository.findOne(id, {
      relations: includeCards ? ['cards'] : [],
    });
    if (!entity) throw new NotFoundException('Set not found');
    if (userId && entity.userId !== userId)
      throw new ForbiddenException('Set does not belong to user');
    entity.srsStatus = (await this.getSrsStatus(userId, entity.id))[0].status;
    return entity;
  }

  /**
   * Removes an existing set.
   * @param id - The id of the set to remove.
   * @param userId - The id of the user for which to remove the set.
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set does not belong to the specified user id.
   */
  async removeById(id: string, userId?: string): Promise<void> {
    // Ensure the set exists for this user
    await this.findOneById(id, userId);
    // Delete the set
    await this.setRepository.delete(id);
  }

  /**
   * Creates a new set.
   * @param userId - The user to create the set for.
   * @param set - The data to create the set with.
   * @returns The created set.
   */
  async create(userId: string, set: CreateOrUpdateSetDto): Promise<SetEntity> {
    const result = await this.setRepository.insert({ ...set, userId });
    return this.findOneById(result.identifiers[0]['id'], userId);
  }

  /**
   * Updates a set
   * @param userId - The user to update the set for.
   * @param id - The ID of the set to update
   * @param set - The updated set object
   * @returns The updated set object. Is null if the set was not found.
   * @throws {NotFoundException} when no set was found for the given id.
   */
  async update(
    userId: string,
    id: string,
    set: CreateOrUpdateSetDto,
  ): Promise<SetEntity> {
    // Ensure the set exists
    await this.findOneById(id, userId);
    // Update the set
    await this.setRepository.update(id, { ...set, userId });
    // Find the set
    const entity = await this.findOneById(id, userId);
    if (entity)
      entity.srsStatus = (await this.getSrsStatus(userId, entity.id))[0].status;
    return entity;
  }

  private async getSrsStatus(
    userId?: string,
    setId?: string,
  ): Promise<Array<{ setId: string; status: SetSrsStatus }>> {
    const countQuery = `
SELECT sets.id as setId, COALESCE(SUM(reviews), 0) reviews, COALESCE(SUM(lessons), 0) lessons
FROM set_entity sets
         LEFT JOIN (
-- GET LESSON AND REVIEW COUNTS PER CARD
    SELECT cards.id                                      cardId,
           cards.setId                                   setId,
           coalesce(cardReviews.reviewableReviews, 0) as reviews,
           IIF(se.modes LIKE '%enToJp%', 1, 0)
               + IIF(se.modes LIKE '%jpToEn%', 1, 0)
               + IIF(se.modes LIKE '%kanjiToKana%' AND cards.valueSupportedmodes LIKE '%kanjiToKana%', 1, 0)
               - coalesce(cardReviews.totalReviews, 0)   lessons
    FROM card_entity cards
             LEFT JOIN (
-- GET REVIEW COUNTS PER CARD
        SELECT cardId,
               setId,
               COUNT(cardId)   as totalReviews,
               SUM(reviewable) as reviewableReviews
        FROM (
                 SELECT cardId, ce.setId setId, CAST(strftime('%s', reviewDate) AS INT) < ? reviewable
                 FROM review_entity
                          INNER JOIN card_entity ce on review_entity.cardId = ce.id
                 GROUP BY cardId, mode
             ) cardsWithAReview
                 LEFT JOIN set_entity ON set_entity.id = cardsWithAReview.setId
        ${userId ? 'WHERE set_entity.userId = ?' : ''}
        GROUP BY cardId, setId
    ) cardReviews ON cardReviews.cardId = cards.id
             INNER JOIN set_entity se on cards.setId = se.id
) cardsWithReviewAndLessonCounts on cardsWithReviewAndLessonCounts.setId = sets.id
${userId || setId ? 'WHERE' : ''}
${[userId ? 'sets.userId = ?' : null, setId ? 'sets.id = ?' : null]
  .filter((l) => !!l)
  .join(' AND ')}
GROUP BY sets.id
    `;
    const countParameters: any[] = [
      moment().startOf('hour').add(1, 'hour').unix(),
    ];
    if (userId) countParameters.push(userId, userId);
    if (setId) countParameters.push(setId);
    const countResults: Array<{
      setId: string;
      reviews: number;
      lessons: number;
    }> = await this.setRepository.query(countQuery, countParameters);

    const levelQuery = `
SELECT se.id setId, re.currentLevel as srsLevel, COUNT() reviews
FROM review_entity re
         INNER JOIN card_entity ce on ce.id = re.cardId
         INNER JOIN set_entity se on ce.setId = se.id
${userId || setId ? `WHERE` : ``}
${[userId ? 'se.userId = ?' : null, setId ? 'setId = ?' : null]
  .filter((l) => !!l)
  .join(' AND ')}

GROUP BY setId, srsLevel
`;
    const levelParameters: any[] = [];
    if (userId) levelParameters.push(userId);
    if (setId) levelParameters.push(setId);
    const levelResults: Array<{
      setId: string;
      srsLevel: number;
      reviews: number;
    }> = await this.setRepository.query(levelQuery, levelParameters);

    return countResults.map((countResult) => ({
      setId: countResult.setId,
      status: {
        lessons: countResult.lessons,
        reviews: countResult.reviews,
        levelItems: levelResults
          .filter((levelResult) => levelResult.setId === countResult.setId)
          .reduce(
            (levelItems, levelResult) => (
              (levelItems[levelResult.srsLevel] = levelResult.reviews),
              levelItems
            ),
            {},
          ),
      },
    }));
  }
}
