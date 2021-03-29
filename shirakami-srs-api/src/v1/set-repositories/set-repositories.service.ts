import {
  BadGatewayException,
  ConflictException,
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
  SUPPORTED_REPOSITORY_INDEX_VERSIONS,
} from '../v1.constants';
import { memoizeAsync } from 'utils-decorators';
import { SetRepositoryIndexDto } from './dtos/set-repository-index.dto';
import { AxiosResponse } from 'axios';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { buildVersion } from '../../assets/build-version.json';

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
        case 'NON_OK_RESPONSE':
          throw new BadGatewayException(e.message, 'REPOSITORY_ERROR');
        case 'UNSUPPORTED_INDEX':
          throw new BadGatewayException({
            error: 'REPOSITORY_UNSUPPORTED_INDEX',
            message: `The index version of the repository (${e.version}) is not supported by ShiraKamiSRS (${buildVersion})`,
            indexVersion: e.version ?? null,
            buildVersion,
          });
        case 'INVALID_INDEX':
          throw new BadGatewayException({
            error: 'REPOSITORY_INVALID_INDEX',
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
    // Check if a repository with this public ID was already added for the user
    if (
      await this.setRepositoryRepository.findOne({
        where: {
          publicId: index.publicId,
          userId: Raw((alias) => `${alias} IS NULL OR ${alias} = :userId`, {
            userId,
          }),
        },
      })
    ) {
      throw new ConflictException(
        `This repository (or another repository with the same public ID) has already been added.`,
        'REPOSITORY_EXISTS',
      );
    }
    // Save the repository reference
    const repository: SetRepositoryEntity = await this.setRepositoryRepository.save(
      {
        publicId: index.publicId,
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
    let index: SetRepositoryIndexEntity;
    try {
      index = await this.fetchRepositoryIndex(repository.indexUrl);
    } catch (e) {
      switch (e?.code) {
        case 'CANNOT_REACH':
          throw new BadGatewayException(e.message, 'REPOSITORY_UNAVAILABLE');
        case 'RESPONSE_ERROR':
        case 'NON_OK_RESPONSE':
          throw new BadGatewayException(e.message, 'REPOSITORY_ERROR');
        case 'UNSUPPORTED_INDEX':
          throw new BadGatewayException({
            error: 'REPOSITORY_UNSUPPORTED_INDEX',
            message: `The index version of the repository (${e.version}) is not supported by ShiraKamiSRS (${buildVersion})`,
            indexVersion: e.version ?? null,
            buildVersion,
          });
        case 'INVALID_INDEX':
          throw new BadGatewayException({
            error: 'REPOSITORY_INVALID_INDEX',
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
    // Update db entry
    await this.setRepositoryRepository.update(repoId, {
      name: index.name,
      imageUrl: index.imageUrl,
    });
    return index;
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
    cache: new Map(),
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
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
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
    if (!SUPPORTED_REPOSITORY_INDEX_VERSIONS.includes(resp.data.version)) {
      throw {
        code: 'UNSUPPORTED_INDEX',
        message: 'The index provided by the repository could not be parsed.',
        version: resp.data.version,
      };
    }
    let index: SetRepositoryIndexDto;
    try {
      index = plainToClass(SetRepositoryIndexDto, resp.data);
    } catch (e) {
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
