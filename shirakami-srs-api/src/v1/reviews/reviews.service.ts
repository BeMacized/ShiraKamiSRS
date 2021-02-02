import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewMode } from './dtos/review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import * as moment from 'moment';
import 'moment-round';
import { ReviewEntity } from './entities/review.entity';
import { CardsService } from '../sets/cards/cards.service';

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
  ): Promise<ReviewEntity[]> {
    return await this.reviewRepository.find({
      where: {
        reviewDate: Between(
          moment.unix(1).toDate().toISOString(),
          moment()
            .startOf('hour')
            .add(timespan, 'seconds')
            .toDate()
            .toISOString(),
        ),
      },
    });
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
    if (moment(review.reviewDate).isAfter(moment()))
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
    const newReview = await this.reviewRepository.save({
      cardId: card.id,
      mode: review.mode,
      creationDate: new Date(),
      reviewDate: moment()
        .add(
          user.srsSettings.levels.find((l) => l.id === newLevel).levelDuration,
          'seconds',
        )
        .toDate(),
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
    console.log('SAVING', {
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
