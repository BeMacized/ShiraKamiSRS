import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewDto, ReviewMode, ReviewSetDto } from './dtos/review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import * as moment from 'moment';
import 'moment-round';
import { ReviewEntity } from './entities/review.entity';
import { CardsService } from '../sets/cards/cards.service';
import { CardDto } from '../sets/cards/dtos/card.dto';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { omit } from 'lodash';
import { SetEntity } from '../sets/entities/set.entity';
import { SetDto } from '../sets/dtos/set.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
    private cardService: CardsService,
  ) {}

  /**
   * Find a specific review by its id.
   * @param id - The id of the review to find.
   * @param userId - The id of the user for which to look up the review. (Optional)
   * @returns The found review.
   * @throws {NotFoundException} when no review was found for the given id.
   * @throws {ForbiddenException} when the review does not belong to the specified user id.
   */
  async findOneById(id: string, userId?: string): Promise<ReviewEntity> {
    const entity = await this.reviewRepository.findOne(id);
    if (!entity) throw new NotFoundException('Review not found');
    try {
      await this.cardService.findOneById(entity.cardId);
    } catch (e) {
      if (e instanceof ForbiddenException)
        throw new ForbiddenException('Review does not belong to user');
      throw e;
    }
    return entity;
  }

  public async getAvailableReviews(
    user: UserEntity,
    timespan = 3600,
    setId?: string,
  ): Promise<ReviewSetDto> {
    let reviewQuery = await this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.card', 'card')
      .leftJoinAndSelect('card.set', 'set')
      .where('(reviewDate BETWEEN :low AND :high)', {
        low: moment.unix(0).toDate().toISOString(),
        high: moment()
          .startOf('hour')
          .add(Math.max(timespan - 1, 0), 'seconds')
          .toDate()
          .toISOString(),
      })
      .andWhere('(currentLevel < :maxLevel)', {
        maxLevel: user.srsSettings.levels.reduce(
          (acc, e) => Math.max(acc, e.id),
          0,
        ),
      })
      .andWhere('(set.userId = :userId)', { userId: user.id })
      .andWhere(`(set.modes LIKE '%'||mode||'%')`);
    if (setId) {
      reviewQuery = reviewQuery.andWhere('(card.setId = :setId)', {
        setId: setId,
      });
    }
    const reviews = await reviewQuery.getMany();
    const cards: CardEntity[] = Object.values(
      reviews.reduce(
        (acc, e) => ((acc[e.cardId] = e.card as CardEntity), acc),
        {},
      ),
    );
    return {
      reviews: reviews.map((entity) =>
        ReviewDto.fromEntity(omit(entity, ['card'])),
      ),
      cards: cards.map((entity) => CardDto.fromEntity(entity)),
      sets: cards
        .map((entity) => entity.set)
        .reduce((acc, set) => {
          if (!acc.find((s) => s.id === set.id)) acc.push(set);
          return acc;
        }, [] as SetEntity[])
        .map((set) => SetDto.fromEntity(set)),
    };
  }

  public async submitReview(
    user: UserEntity,
    reviewId: string,
    score: number,
  ): Promise<ReviewEntity> {
    if (score > 1)
      throw new BadRequestException(null, 'Score cannot be more than 1');
    if (score === 0)
      throw new BadRequestException(null, 'Score cannot be equal to 0');
    // Get the review
    const review = await this.reviewRepository.findOne(reviewId);
    if (!review) throw new NotFoundException('Review not found');
    // Find card and make sure it belongs to the user
    const card = await this.cardService.findOneById(review.cardId, user.id);
    // Check if the review is already maxed out
    const maxLevel = user.srsSettings.levels.reduce(
      (acc, e) => Math.max(acc, e.id),
      0,
    );
    if (review.currentLevel === maxLevel)
      throw new BadRequestException(null, 'Review is already at max level.');
    // Check if the review date has passed
    if (moment(review.reviewDate).startOf('hour').isAfter(moment()))
      throw new BadRequestException(
        null,
        'Review is not yet available until ' + review.reviewDate.toISOString(),
      );
    // Determine the new level
    const srsLevel = user.srsSettings.levels.find(
      (level) => level.id === review.currentLevel,
    );
    const levelMod =
      score === 1
        ? 1
        : Math.ceil(Math.abs(score) / 2) * srsLevel.penaltyMultiplier * -1;
    const newLevel = Math.min(
      Math.max(review.currentLevel + levelMod, 0),
      maxLevel,
    );
    // Create the new review
    const levelDuration = user.srsSettings.levels.find((l) => l.id === newLevel)
      .levelDuration;
    const newReview = await this.reviewRepository.save({
      cardId: card.id,
      mode: review.mode,
      creationDate: new Date(),
      reviewDate: moment().add(levelDuration, 'seconds').toDate(),
      currentLevel: newLevel,
    });
    // Delete the old review
    await this.reviewRepository.delete(reviewId);
    // Return the new review
    return newReview;
  }

  public async createReview(
    user: UserEntity,
    mode: ReviewMode,
    cardId: string,
  ): Promise<ReviewEntity> {
    // Check if a review already exists
    const review = await this.reviewRepository.findOne({ cardId, mode });
    if (review)
      throw new ConflictException(
        null,
        'A review already exists for this card.',
      );

    // Find card and make sure it belongs to the user
    const card = await this.cardService.findOneById(cardId, user.id);

    // Make sure the mode is within the set modes
    if (!card.set.modes.includes(mode))
      throw new BadRequestException(
        null,
        'Tried creating a review with a mode that was not within the set mode list for the given card.',
      );

    // Create the review
    return await this.reviewRepository.save({
      cardId,
      mode,
      creationDate: new Date(),
      reviewDate: moment()
        .add(
          user.srsSettings.levels.find((l) => l.id === 0).levelDuration,
          'seconds',
        )
        .toDate(),
      currentLevel: 0,
    });
  }
}
