import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCardDTO } from './dtos/card.dto';
import { CardEntity, CreateCardEntity } from './entities/card.entity';
import { SetsService } from '../sets.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(CardEntity)
    private cardRepository: Repository<CardEntity>,
    private setsService: SetsService,
  ) {}

  async findBySetId(setId: string): Promise<CardEntity[]> {
    const set = await this.setsService.findOneById(setId);
    return set.cards;
  }

  /**
   * Find a specific card by its id.
   * @param id - The id of the card to find.
   * @returns The found card.
   * @throws {NotFoundException} when no card was found for the given id.
   */
  async findOneById(id: string): Promise<CardEntity> {
    const entity = await this.cardRepository.findOne(id, {
      relations: ['set'],
    });
    if (!entity) throw new NotFoundException();
    return entity;
  }

  /**
   * Removes an existing card.
   * @param id - The id of the card to remove
   * @throws {NotFoundException} when no card was found for the given id.
   */
  async removeById(id: string): Promise<void> {
    if (!(await this.findOneById(id))) throw new NotFoundException();
    await this.cardRepository.delete(id);
  }

  /**
   * Creates a new card
   * @param card - The data to create the card with
   * @returns The created card
   */
  async create(card: CreateCardEntity): Promise<CardEntity> {
    const result = await this.cardRepository.insert(card);
    return this.findOneById(result.identifiers[0]['id']);
  }

  /**
   * Updates a card
   * @param id - The ID of the card to update
   * @param set - The updated card object
   * @returns The updated card object. Is null if the card was not found.
   * @throws {NotFoundException} when no card was found for the given id.
   */
  async update(id: string, card: BaseCardDTO): Promise<CardEntity> {
    await this.cardRepository.update(id, card);
    return this.findOneById(id);
  }
}
