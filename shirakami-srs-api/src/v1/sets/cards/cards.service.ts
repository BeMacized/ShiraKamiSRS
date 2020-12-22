import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CardEntity,
  CreateCardEntity,
  UpdateCardEntity,
} from './entities/card.entity';
import { SetsService } from '../sets.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    private setsService: SetsService,
  ) {}

  /**
   * Finds all cards from a set.
   * @param setId - The set to look up cards for.
   * @param userId - The id of the user to which the set should belong (optional).
   * @returns The founds cards.
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set does not belong to the specified user.
   */
  async findBySetId(setId: string, userId?: string): Promise<CardEntity[]> {
    const set = await this.setsService.findOneById(setId, userId);
    return set.cards;
  }

  /**
   * Find a specific card by its id.
   * @param id - The id of the card to find.
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
    await this.findOneById(id, userId);
    // Delete the card
    await this.cardRepository.delete(id);
  }

  /**
   * Creates a new card
   * @param card - The data to create the card with
   * @param userId - The id of the user for which to create the card.
   * @returns The created card
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set the card belongs to does not belong to the specified user id.
   */
  async create(card: CreateCardEntity, userId?: string): Promise<CardEntity> {
    // Ensure the set exists
    if (userId) await this.setsService.findOneById(card.setId, userId);
    // Create the card
    const result = await this.cardRepository.insert(card);
    // Find and return the card
    return this.findOneById(result.identifiers[0]['id']);
  }

  /**
   * Updates a card
   * @param id - The ID of the card to update
   * @param card - The updated card object
   * @param userId - The id of the user for which to update the card.
   * @returns The updated card object. Is null if the card was not found.
   * @throws {NotFoundException} when no card or set were found for the given ids.
   * @throws {ForbiddenException} when the set the card belongs to does not belong to the specified user id.
   */
  async update(
    id: string,
    card: UpdateCardEntity,
    userId?: string,
  ): Promise<CardEntity> {
    // Ensure the card exists
    await this.findOneById(card.id, userId);
    // Update the card
    await this.cardRepository.update(id, card);
    // Find and return the card
    return this.findOneById(id);
  }
}
