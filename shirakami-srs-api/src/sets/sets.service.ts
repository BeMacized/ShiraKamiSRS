// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSetEntity, SetEntity } from './entities/set.entity';
import { Repository } from 'typeorm';
import { BaseSetDTO } from './dtos/set.dto';

@Injectable()
export class SetsService {
  constructor(
    @InjectRepository(SetEntity)
    private setRepository: Repository<SetEntity>,
  ) {}

  /**
   * Finds all sets.
   */
  async findAll(): Promise<SetEntity[]> {
    return this.setRepository.find();
  }

  /**
   * Find a specific set by its id.
   * @param id - The id of the set to find.
   * @returns The found set.
   * @throws {NotFoundException} when no set was found for the given id.
   */
  async findOneById(id: string): Promise<SetEntity> {
    const entity = await this.setRepository.findOne(id, {
      relations: ['cards'],
    });
    if (!entity) throw new NotFoundException();
    return entity;
  }

  /**
   * Removes an existing set.
   * @param id - The id of the set to remove
   * @throws {NotFoundException} when no set was found for the given id.
   */
  async removeById(id: string): Promise<void> {
    if (!(await this.findOneById(id))) throw new NotFoundException();
    await this.setRepository.delete(id);
  }

  /**
   * Creates a new set
   * @param set - The data to create the set with
   * @returns The created set
   */
  async create(set: CreateSetEntity): Promise<SetEntity> {
    const result = await this.setRepository.insert(set);
    return this.findOneById(result.identifiers[0]['id']);
  }

  /**
   * Updates a set
   * @param id - The ID of the set to update
   * @param set - The updated set object
   * @returns The updated set object. Is null if the set was not found.
   * @throws {NotFoundException} when no set was found for the given id.
   */
  async update(id: string, set: BaseSetDTO): Promise<SetEntity> {
    await this.setRepository.update(id, set);
    return this.findOneById(id);
  }
}
