import {
  ForbiddenException,
  HttpService,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SetRepositoryEntity } from './entities/set-repository.entity';
import { SetRepositoryIndexEntity } from './entities/set-repository-index.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CardEntity } from '../sets/cards/entities/card.entity';
import { Column, PrimaryGeneratedColumn, Raw, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  MAX_CARDS_PER_SET,
  MAX_SET_REPOSITORIES_PER_USER,
} from '../v1.constants';
import { memoizeAsync } from 'utils-decorators';
import { SetRepositoryIndexDto } from './dtos/set-repository-index.dto';

@Injectable()
export class SetRepositoriesService {
  constructor(
    @InjectRepository(SetRepositoryEntity)
    private setRepositoryRepository: Repository<SetRepositoryEntity>,
    private userService: UsersService,
    private httpService: HttpService,
  ) {}

  async addRepository(
    userId: string,
    indexUrl: string,
  ): Promise<SetRepositoryEntity> {
    // Check if user is still under the max allowed repositories per user
    const repositoryCount = await this.setRepositoryRepository.count({
      where: {
        userId,
      },
    });
    if (repositoryCount >= MAX_SET_REPOSITORIES_PER_USER) {
      throw new ForbiddenException(
        `Maximum allowed repositories reached (${MAX_SET_REPOSITORIES_PER_USER}).`,
        'SET_REPOSITORY_LIMIT_EXCEEDED',
      );
    }
    // Attempt to fetch the repository index
    let index: SetRepositoryIndexEntity;
    try {
      index = await this.fetchRepositoryIndex(indexUrl);
      if (!index) throw 'WEWLAD';
    } catch (e) {
      // TODO: PROCESS ERROR HANDLING
      return;
    }
    // Save the repository reference
    const repository: SetRepositoryEntity = await this.setRepositoryRepository.save(
      {
        userId,
        indexUrl,
        name: index.name,
        imageUrl: index.imageUrl,
      },
    );

    return repository;
  }

  async getRepositories(userId: string): Promise<SetRepositoryEntity[]> {
    return this.setRepositoryRepository.find({
      where: {
        userId: Raw((alias) => `${alias} IS NULL OR ${alias} = :userId`, {
          userId,
        }),
      },
    });
  }

  async getRepositoryIndex(
    userId: string,
    repoId: string,
  ): Promise<SetRepositoryIndexEntity> {
    return null;
  }

  async removeRepository(userId: string, repoId: string): Promise<void> {
    const repository = await this.setRepositoryRepository.findOne(repoId);
    if (!repository) throw new NotFoundException('Set repository not found');
    if (!repository.userId || repository.userId !== userId)
      throw new ForbiddenException(
        'Cannot remove set repository that user does not own',
      );
    await this.setRepositoryRepository.remove(repository);
  }

  // @memoizeAsync({
  //   expirationTimeMs: 1000 * 60 * 5,
  //   TODO: When moving to multiple instances, add redis implementation for caching
  // })
  async fetchRepositoryIndex(
    indexUrl: string,
  ): Promise<SetRepositoryIndexEntity> {
    try {
      const resp = await this.httpService
        .get<SetRepositoryIndexDto>(indexUrl, {
          timeout: 5000,
          timeoutErrorMessage: 'The connection to the repository timed out.',
          maxContentLength: 1024 * 1024 * 2, // Max 2MB
          maxBodyLength: 1024 * 1024 * 2, // Max 2MB,
        })
        .toPromise();
      console.log('WEW, SUCCESS');
      console.log(resp);
    } catch (e) {
      console.log('WEW, ERROR');
      console.error(e);
    }
    return null;
  }
}
