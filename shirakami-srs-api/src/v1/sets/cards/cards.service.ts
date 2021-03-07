import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, MoreThan, Repository } from 'typeorm';
import {
  buildSupportedCardModes,
  CardEntity,
  CreateOrUpdateCardEntity,
} from './entities/card.entity';
import { SetsService } from '../sets.service';
import { CreateOrUpdateCardDto } from './dtos/card.dto';
import { plainToClass } from 'class-transformer';
import { MAX_CARDS_PER_SET } from '../../v1.constants';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    private setsService: SetsService,
    private con: Connection,
  ) {}

  /**
   * Finds all cards from a set.
   * @param setId - The set to look up cards for.
   * @param userId - The id of the user to which the set should belong (optional).
   * @param includeReviews - Whether to include reviews with the cards (Default: false).
   * @returns The founds cards.
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set does not belong to the specified user.
   */
  async findBySetId(
    setId: string,
    userId?: string,
    includeReviews = false,
  ): Promise<CardEntity[]> {
    const set = await this.setsService.findOneById(
      setId,
      userId,
      true,
      includeReviews,
    );
    return set.cards;
  }

  /**
   * Find a specific card by its id.
   * @param id - The id of the card to find.
   * @param userId - The id of the user for which to find the card.
   * @returns The found card.
   * @throws {NotFoundException} when no card or set were found for the given ids.
   * @throws {ForbiddenException} when the set the card belongs to does not belong to the specified user.
   */
  async findOneById(id: string, userId?: string): Promise<CardEntity> {
    const entity = await this.cardRepository.findOne(id, {
      relations: ['set'],
    });
    if (!entity) throw new NotFoundException('Card not found');
    if (userId && entity.set.userId !== userId)
      throw new ForbiddenException('Card does not belong to user');
    return entity;
  }

  /**
   * Removes an existing card.
   * @param id - The id of the card to remove
   * @param userId - The id of the user for which to remove the card.
   * @throws {NotFoundException} when no card or set were found for the given ids.
   * @throws {ForbiddenException} when the set the card belongs to does not belong to the specified user id.
   */
  async removeById(id: string, userId?: string): Promise<void> {
    // Ensure the card exists for this user
    const card = await this.findOneById(id, userId);
    // Run deletion in transaction
    const qr = this.con.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      await qr.manager.remove(card);
      await qr.manager.update(
        CardEntity,
        { sortIndex: MoreThan(card.sortIndex), setId: card.setId },
        { sortIndex: () => 'sortIndex - 1' },
      );
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  /**
   * Creates a new card
   * @param setId - The set to create the card for
   * @param card - The data to create the card with
   * @param userId - The id of the user for which to create the card.
   * @returns The created card
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set the card belongs to does not belong to the specified user id.
   */
  async create(
    setId: string,
    card: CreateOrUpdateCardDto,
    userId?: string,
  ): Promise<CardEntity> {
    // Ensure the set exists and belongs to the user
    await this.setsService.findOneById(setId, userId, false);

    const qr = this.con.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    let createdCard: CardEntity;
    try {
      // Ensure there is room for more cards
      const cardCount = await qr.manager
        .createQueryBuilder()
        .select()
        .from(CardEntity, 'card')
        .where('card.setId = :setId', { setId })
        .getCount();
      if (cardCount >= MAX_CARDS_PER_SET)
        throw new ForbiddenException(
          `Maximum allowed cards per set reached (${MAX_CARDS_PER_SET}).`,
          'CARD_LIMIT_EXCEEDED',
        );
      // Construct the entity to save
      const cardEntity: CreateOrUpdateCardEntity = {
        ...card,
        value: { ...card.value, supportedModes: [] },
        setId,
        sortIndex: cardCount,
      };
      // Determine the supported modes for this card
      cardEntity.value.supportedModes = buildSupportedCardModes(
        cardEntity.value,
      );
      // Create the card
      createdCard = await qr.manager.save(plainToClass(CardEntity, cardEntity));
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }

    // Find and return the card
    return this.findOneById(createdCard.id);
  }

  /**
   * Updates a card
   * @param setId - The set the card to be updated belongs to
   * @param id - The ID of the card to update
   * @param card - The updated card object
   * @param userId - The id of the user for which to update the card.
   * @returns The updated card object. Is null if the card was not found.
   * @throws {NotFoundException} when no card or set were found for the given ids.
   * @throws {ForbiddenException} when the set the card belongs to does not belong to the specified user id.
   */
  async update(
    setId: string,
    id: string,
    card: CreateOrUpdateCardDto,
    userId?: string,
  ): Promise<CardEntity> {
    // Ensure the card exists
    const existingCard = await this.findOneById(id, userId);
    // Reconstruct the entity to save
    const cardEntity: CreateOrUpdateCardEntity = {
      ...card,
      value: { ...card.value, supportedModes: [] },
      setId,
      sortIndex: existingCard.sortIndex,
    };
    // Redetermine the supported modes for this card
    cardEntity.value.supportedModes = buildSupportedCardModes(cardEntity.value);
    // Update the card
    await this.cardRepository.update(id, cardEntity);
    // Find and return the card
    return this.findOneById(id);
  }
}
