import {
  BadGatewayException,
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
  MAX_SET_REPOSITORY_INDEX_SIZE,
} from '../v1.constants';
import { memoizeAsync } from 'utils-decorators';
import { SetRepositoryIndexDto } from './dtos/set-repository-index.dto';
import { AxiosResponse } from 'axios';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

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
    } catch (e) {
      switch (e?.code) {
        case 'CANNOT_REACH':
          throw new BadGatewayException(e.message, 'REPOSITORY_UNAVAILABLE');
        case 'RESPONSE_ERROR':
          throw new BadGatewayException(e.message, 'REPOSITORY_ERROR');
        case 'NOT_OK_RESPONSE':
          throw new BadGatewayException(e.message, 'REPOSITORY_ERROR');
        case 'INVALID_INDEX':
          throw new BadGatewayException({
            code: 'REPOSITORY_INVALID_INDEX',
            message: e.message,
            validationErrors: e.validationErrors ?? [],
          });
        case 'UNKNOWN_ERROR':
        default:
          throw new BadGatewayException(
            e?.message ??
              'An unknown error occurred while contacting the repository.',
            'REPOSITORY_UNKNOWN_ERROR',
          );
      }
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
    const repository = await this.setRepositoryRepository.findOne(repoId);
    if (!repository) throw new NotFoundException('Set repository not found.');
    if (repository.userId && repository.userId !== userId)
      throw new ForbiddenException(
        'Cannot fetch index for set repository that is owned by someone else.',
      );
    try {
      return await this.fetchRepositoryIndex(repository.indexUrl);
    } catch (e) {
      switch (e?.code) {
        case 'CANNOT_REACH':
          throw new BadGatewayException(e.message, 'REPOSITORY_UNAVAILABLE');
        case 'RESPONSE_ERROR':
          throw new BadGatewayException(e.message, 'REPOSITORY_ERROR');
        case 'NOT_OK_RESPONSE':
          throw new BadGatewayException(e.message, 'REPOSITORY_ERROR');
        case 'INVALID_INDEX':
          throw new BadGatewayException({
            code: 'REPOSITORY_INVALID_INDEX',
            message: e.message,
            validationErrors: e.validationErrors ?? [],
          });
        case 'UNKNOWN_ERROR':
        default:
          throw new BadGatewayException(
            e?.message ??
              'An unknown error occurred while contacting the repository.',
            'REPOSITORY_UNKNOWN_ERROR',
          );
      }
    }
  }

  async removeRepository(userId: string, repoId: string): Promise<void> {
    const repository = await this.setRepositoryRepository.findOne(repoId);
    if (!repository) throw new NotFoundException('Set repository not found.');
    if (!repository.userId || repository.userId !== userId)
      throw new ForbiddenException(
        'Cannot remove set repository that user does not own.',
      );
    await this.setRepositoryRepository.remove(repository);
  }

  @memoizeAsync({
    expirationTimeMs: 1000 * 60 * 5,
    // TODO: When moving to multiple instances, add redis implementation for caching
  })
  async fetchRepositoryIndex(
    indexUrl: string,
  ): Promise<SetRepositoryIndexEntity> {
    // Fetch repository index
    let resp: AxiosResponse<SetRepositoryIndexDto>;
    try {
      resp = await this.httpService
        .get<SetRepositoryIndexDto>(indexUrl, {
          timeout: 5000,
          timeoutErrorMessage: 'The connection to the repository timed out.',
          maxContentLength: MAX_SET_REPOSITORY_INDEX_SIZE,
          maxBodyLength: MAX_SET_REPOSITORY_INDEX_SIZE,
        })
        .toPromise();
    } catch (e) {
      if (!e.response) {
        switch (e.code) {
          case 'ECONNABORTED':
          case 'ECONNREFUSED':
            throw {
              code: 'CANNOT_REACH',
              message: 'The repository could not be reached.',
            };
          default:
            throw {
              code: 'RESPONSE_ERROR',
              message:
                e.message ??
                'An unknown error occurred when contacting the repository.',
            };
        }
      } else if (e.response.status) {
        throw {
          code: 'NON_OK_RESPONSE',
          message: e.message,
          status: e.response.status,
        };
      } else {
        console.error(e);
        throw {
          code: 'UNKNOWN_ERROR',
          message:
            e?.message ??
            'An unknown error occurred when contacting the repository.',
        };
      }
    }
    // Validate repository response
    if (typeof resp.data !== 'object')
      throw {
        code: 'INVALID_INDEX',
        message: 'The index provided by the repository is not valid JSON.',
      };
    let index: SetRepositoryIndexDto;
    try {
      index = plainToClass(SetRepositoryIndexDto, resp.data);
    } catch (e) {
      console.error(e);
      throw {
        code: 'INVALID_INDEX',
        message: 'The index provided by the repository could not be parsed.',
      };
    }
    try {
      await validateOrReject(index);
    } catch (errors) {
      throw {
        code: 'INVALID_INDEX',
        message:
          'The index provided by the repository did not match the required format.',
        validationErrors: errors,
      };
    }
    return SetRepositoryIndexDto.toEntity(index);
  }
}
