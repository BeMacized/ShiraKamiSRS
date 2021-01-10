// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrUpdateSetEntity, SetEntity } from './entities/set.entity';
import { Repository } from 'typeorm';

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
    try {
      const res = await this.setRepository.query(
        `
SELECT card.*, srs.*
FROM card_entity card
INNER JOIN srs_level_entity srs ON card.srsLevelEnToJpId=srs.id;

      `,
        [],
      );
      console.log(res);
    } catch (e) {
      console.error(e);
    }

    return sets;
  }

  /**
   * Find a specific set by its id.
   * @param id - The id of the set to find.
   * @param userId - The id of the user for which to look up the set. (optional)
   * @returns The found set.
   * @throws {NotFoundException} when no set was found for the given id.
   * @throws {ForbiddenException} when the set does not belong to the specified user id.
   */
  async findOneById(id: string, userId?: string): Promise<SetEntity> {
    const entity = await this.setRepository.findOne(id, {
      relations: ['cards'],
    });
    if (!entity) throw new NotFoundException('Set not found');
    if (userId && entity.userId !== userId)
      throw new ForbiddenException('Set does not belong to user');
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
   * @param set - The data to create the set with.
   * @returns The created set.
   */
  async create(set: CreateOrUpdateSetEntity): Promise<SetEntity> {
    const result = await this.setRepository.insert(set);
    return this.findOneById(result.identifiers[0]['id'], set.userId);
  }

  /**
   * Updates a set
   * @param id - The ID of the set to update
   * @param set - The updated set object
   * @returns The updated set object. Is null if the set was not found.
   * @throws {NotFoundException} when no set was found for the given id.
   */
  async update(id: string, set: CreateOrUpdateSetEntity): Promise<SetEntity> {
    // Ensure the set exists
    await this.findOneById(id, set.userId);
    // Update the set
    await this.setRepository.update(id, set);
    // Find the set
    return this.findOneById(id, set.userId);
  }
}
