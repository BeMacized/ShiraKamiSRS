import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SetRepositoriesService } from './set-repositories.service';
import { JWTGuard } from '../authentication/guards/jwt.guard';
import {
  CreateOrUpdateSetRepositoryDto,
  SetRepositoryDto,
} from './dtos/set-repository.dto';
import { SetRepositoryIndexDto } from './dtos/set-repository-index.dto';
import { Throttle } from '@nestjs/throttler';
import { User } from '../common/decorators/user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@Controller()
export class SetRepositoriesController {
  constructor(private setRepositoriesService: SetRepositoriesService) {}

  @Get()
  @UseGuards(JWTGuard)
  async getRepositories(@User() user: UserEntity): Promise<SetRepositoryDto[]> {
    return this.setRepositoriesService
      .getRepositories(user.id)
      .then((repositories) => repositories.map(SetRepositoryDto.fromEntity));
  }

  @Get(':repoId/index')
  @UseGuards(JWTGuard)
  async getRepositoryIndex(
    @User() user: UserEntity,
    @Param('repoId') repoId: string,
  ): Promise<SetRepositoryIndexDto> {
    return this.setRepositoriesService
      .getRepositoryIndex(user.id, repoId)
      .then(SetRepositoryIndexDto.fromEntity);
  }

  @Post()
  @UseGuards(JWTGuard)
  @Throttle(10, 60 * 60)
  async addRepository(
    @User() user: UserEntity,
    @Body() payload: CreateOrUpdateSetRepositoryDto,
  ): Promise<SetRepositoryDto> {
    const repository = await this.setRepositoriesService.addRepository(
      user.id,
      payload.indexUrl,
    );
    return SetRepositoryDto.fromEntity(repository);
  }

  @Delete(':repoId')
  @UseGuards(JWTGuard)
  async removeRepository(
    @User() user: UserEntity,
    @Param('repoId') repoId: string,
  ) {
    await this.setRepositoriesService.removeRepository(user.id, repoId);
    return { success: true };
  }
}
