// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SetEntity, SetSrsStatus } from './entities/set.entity';
import { Connection, MoreThan, Repository } from 'typeorm';
import * as moment from 'moment';
import { CreateOrUpdateSetDto } from './dtos/set.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  exportSetV1,
  importSetV1,
  SetExportV1,
} from './exporters/set-exporter-v1';
import {
  buildSupportedCardModes,
  CardEntity,
  CreateOrUpdateCardEntity,
} from './cards/entities/card.entity';
import { ReviewEntity } from '../reviews/entities/review.entity';
import { ReviewModes } from '../reviews/dtos/review.dto';
import { plainToClass } from 'class-transformer';
import { orderBy } from 'lodash';
import { MAX_CARDS_PER_SET, MAX_SETS_PER_USER } from '../v1.constants';

@Injectable()
export class SetsService {
  constructor(
    @InjectRepository(SetEntity)
    private setRepository: Repository<SetEntity>,
    private userService: UsersService,
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
    private con: Connection,
  ) {}

  /**
   * Finds all sets.
   * @param user - The id or entity of the user for which to look up the sets.
   */
  async findAll(user: string | UserEntity): Promise<SetEntity[]> {
    if (typeof user === 'string') user = await this.userService.findById(user);
    if (!user) throw new NotFoundException('User not found');
    const sets = await this.setRepository.find({ userId: user.id });
    const statuses = await this.getSrsStatus(user);
    for (const set of sets) {
      set.srsStatus = statuses.find((status) => status.setId === set.id).status;
    }
    return sets;
  }

  /**
   * Find a specific set by its id.
   * @param id - The id of the set to find.
   * @param user - The id or entity of the user for which to look up the set. If not provided, ownership is not checked. (Optional)
   * @param includeCards - Whether to include cards with the set. (Optional, Default: false)
   * @param includeReviews - Whether to include reviews with each card. (Optional, Default: false)
   * @returns The found set.
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set does not belong to the specified user id.
   */
  async findOneById(
    id: string,
    user?: string | UserEntity,
    includeCards = false,
    includeReviews = false,
  ): Promise<SetEntity> {
    if (user) {
      if (typeof user === 'string')
        user = await this.userService.findById(user);
      if (!user) throw new NotFoundException('User not found');
    }
    const entity = await this.setRepository.findOne(id, {
      relations: [
        includeCards ? 'cards' : null,
        includeReviews ? 'cards.reviews' : null,
      ].filter((r) => !!r),
    });
    entity.cards = orderBy(entity.cards, ['sortIndex'], ['asc']);
    if (!entity) throw new NotFoundException('Set not found');
    if (user && entity.userId !== (user as UserEntity).id)
      throw new ForbiddenException('Set does not belong to user');
    entity.srsStatus = (
      await this.getSrsStatus(user as UserEntity, entity.id)
    )[0].status;
    return entity;
  }

  /**
   * Removes an existing set.
   * @param id - The id of the set to remove.
   * @param user - The id or entity of the user for which to remove the set. (Optional)
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set does not belong to the specified user id.
   */
  async removeById(id: string, user?: string | UserEntity): Promise<void> {
    if (user) {
      if (typeof user === 'string')
        user = await this.userService.findById(user);
      if (!user) throw new NotFoundException('User not found');
    }
    // Ensure the set exists for this user
    await this.findOneById(id, user);
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
    const qr = this.con.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    let createdSetId: string;
    try {
      // Ensure there is room for more cards
      const setCount = await qr.manager
        .createQueryBuilder()
        .select()
        .from(SetEntity, 'set')
        .where('userId = :userId', { userId })
        .getCount();
      if (setCount >= MAX_SETS_PER_USER)
        throw new ForbiddenException(
          `Maximum allowed sets reached (${MAX_SETS_PER_USER}).`,
          'SET_LIMIT_EXCEEDED',
        );
      createdSetId = (
        await qr.manager.save(plainToClass(SetEntity, { ...set, userId }))
      ).id;
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
    return this.findOneById(createdSetId, userId);
  }

  /**
   * Updates a set
   * @param id - The ID of the set to update
   * @param set - The updated set object
   * @param user - The id or entity for the user to update the set for. If not provided, ownership is not checked. (Optional)
   * @returns The updated set object. Is null if the set was not found.
   * @throws {NotFoundException} when no set was found for the given id.
   */
  async update(
    id: string,
    set: CreateOrUpdateSetDto,
    user?: string | UserEntity,
  ): Promise<SetEntity> {
    if (user) {
      if (typeof user === 'string')
        user = await this.userService.findById(user);
      if (!user) throw new NotFoundException('User not found');
    }
    // Ensure the set exists
    await this.findOneById(id, user);
    // Update the set
    await this.setRepository.update(id, {
      ...set,
      userId: (user as UserEntity)?.id ?? undefined,
    });
    // Find the set
    const entity = await this.findOneById(id, user);
    if (entity)
      entity.srsStatus = (
        await this.getSrsStatus(user as UserEntity, entity.id)
      )[0].status;
    return entity;
  }

  private async getSrsStatus(
    user: UserEntity,
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
           IF(se.modes LIKE '%enToJp%', 1, 0)
               + IF(se.modes LIKE '%jpToEn%', 1, 0)
               + IF(se.modes LIKE '%kanjiToKana%' AND cards.valueSupportedmodes LIKE '%kanjiToKana%', 1, 0)
               - coalesce(cardReviews.totalReviews, 0)   lessons
    FROM card_entity cards
             LEFT JOIN (
-- GET REVIEW COUNTS PER CARD
        SELECT cardId,
               setId,
               COUNT(cardId)   as totalReviews,
               SUM(reviewable) as reviewableReviews
        FROM (
                 SELECT cardId, ce.setId setId, (UNIX_TIMESTAMP(reviewDate) < ? AND currentLevel < ?) reviewable
                 FROM review_entity
                          INNER JOIN card_entity ce on review_entity.cardId = ce.id
                          INNER JOIN set_entity se on ce.setId = se.id
                 WHERE se.modes LIKE '%'||mode||'%'
                 GROUP BY cardId, mode
             ) cardsWithAReview
                 LEFT JOIN set_entity ON set_entity.id = cardsWithAReview.setId
        WHERE set_entity.userId = ?
        GROUP BY cardId, setId
    ) cardReviews ON cardReviews.cardId = cards.id
             INNER JOIN set_entity se on cards.setId = se.id
) cardsWithReviewAndLessonCounts on cardsWithReviewAndLessonCounts.setId = sets.id
WHERE sets.userId = ?
${setId ? 'AND sets.id = ?' : ''}
GROUP BY sets.id
    `;
    const countParameters: any[] = [
      moment().startOf('hour').add(1, 'hour').unix(),
      user.srsSettings.levels.reduce((acc, e) => Math.max(acc, e.id), 0),
    ];
    countParameters.push(user.id, user.id);
    if (setId) countParameters.push(setId);
    const countResults: Array<{
      setId: string;
      reviews: string;
      lessons: string;
    }> = await this.setRepository.query(countQuery, countParameters);

    const levelQuery = `
SELECT se.id setId, re.currentLevel as srsLevel, COUNT(*) reviews
FROM review_entity re
INNER JOIN card_entity ce on ce.id = re.cardId
INNER JOIN set_entity se on ce.setId = se.id
WHERE se.userId = ?
${setId ? 'AND setId = ?' : ''}
GROUP BY setId, srsLevel
`;
    const levelParameters: any[] = [];
    levelParameters.push(user.id);
    if (setId) levelParameters.push(setId);
    const levelResults: Array<{
      setId: string;
      srsLevel: number;
      reviews: string;
    }> = await this.setRepository.query(levelQuery, levelParameters);

    return countResults.map((countResult) => ({
      setId: countResult.setId,
      status: {
        lessons: parseInt(countResult.lessons),
        reviews: parseInt(countResult.reviews),
        levelItems: levelResults
          .filter((levelResult) => levelResult.setId === countResult.setId)
          .reduce(
            (levelItems, levelResult) => (
              (levelItems[levelResult.srsLevel] = parseInt(
                levelResult.reviews,
              )),
              levelItems
            ),
            {},
          ),
      },
    }));
  }

  /**
   * Export a set by its id
   * @param id - The id of the set to export.
   * @param user - The id or entity of the user for which to export the set. If not provided, ownership is not checked. (Optional)
   * @param includeReviews - Whether to include card reviews with the export (Default: false).
   */
  public async exportSet(
    id: string,
    user?: UserEntity,
    includeReviews = false,
  ): Promise<SetExportV1> {
    // Find the set (and verify ownership)
    const set = await this.findOneById(id, user, true, true);
    return exportSetV1(set, includeReviews);
  }

  /**
   * Import a new set based on a file export.
   * @param exportData - The exported data to import.
   * @param user - The id or entity of the user for which to import the set.
   * @param includeReviews - Whether to also import any reviews if they are present (Default: false).
   */
  public async importSet(
    exportData: SetExportV1,
    user?: string | UserEntity,
    includeReviews = false,
    dryRun = false,
  ): Promise<SetEntity> {
    // Ensure user object exists
    if (user) {
      if (typeof user === 'string')
        user = await this.userService.findById(user);
      if (!user) throw new NotFoundException('User not found');
    }
    // Parse the export data
    const { set, cards, reviews } = importSetV1(exportData);
    // Optionally validate imported reviews
    if (includeReviews && reviews && reviews.length) {
      // Every review has to match a card
      if (reviews.find((r) => r.cardIndex < 0 || r.cardIndex >= reviews.length))
        throw new BadRequestException(
          'Export could not be imported, due to the reviews not matching the included cards.',
        );
      // 1 review per mode per card
      if (
        cards.find((card, cardIndex) =>
          ReviewModes.find(
            (mode) =>
              reviews.filter(
                (r) => r.cardIndex === cardIndex && r.mode === mode,
              ).length > 1,
          ),
        )
      )
        throw new BadRequestException(
          'Export could not be imported, due to the presence conflicting reviews.',
        );
    }
    // Construct set entity
    const setEntity = plainToClass(SetEntity, {
      ...set,
      userId: (user as UserEntity).id,
    });
    // Construct card entity
    const cardEntities = (setId) =>
      cards.map((card, sortIndex) =>
        plainToClass(CardEntity, {
          ...card,
          setId,
          sortIndex,
        }),
      );
    // Dry run, return the set
    if (dryRun) {
      setEntity.cards = cardEntities(null);
      return setEntity;
    }
    // Not a dry run, save the entities
    else {
      // Save entities
      const qr = this.con.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();
      let createdSetId: string;
      let cardIds: string[];
      try {
        // Create the set
        createdSetId = (await qr.manager.save(setEntity)).id;
        // Create the cards for the set
        cardIds = (await qr.manager.save(cardEntities(createdSetId))).map(
          (c) => c.id,
        );
        // Optionally import reviews
        if (includeReviews && reviews && reviews.length) {
          await qr.manager.save(
            reviews.map((reviewData) => {
              const { cardIndex, ...review } = reviewData;
              return plainToClass(ReviewEntity, {
                ...review,
                cardId: cardIds[cardIndex],
              });
            }),
          );
        }
        await qr.commitTransaction();
      } catch (err) {
        await qr.rollbackTransaction();
        throw err;
      } finally {
        await qr.release();
      }
      // Optionally import reviews
      return this.findOneById(createdSetId, (user as UserEntity).id);
    }
  }
}
