import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SetsService } from './sets.service';
import { JWTGuard } from '../authentication/guards/jwt.guard';
import { User } from '../common/user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { CreateOrUpdateSetDto, SetDto } from './dtos/set.dto';
import { SetExportV1 } from './exporters/set-exporter-v1';

@Controller()
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async getAllSets(@User() user: UserEntity): Promise<SetDto[]> {
    return this.setsService
      .findAll(user)
      .then((sets) => sets.map(SetDto.fromEntity));
  }

  @Get(':id')
  @UseGuards(JWTGuard)
  async getSet(
    @Param('id') id: string,
    @User() user: UserEntity,
    @Query('shallow', new DefaultValuePipe('0'), ParseIntPipe) shallow,
  ): Promise<SetDto> {
    const entity = await this.setsService.findOneById(
      id,
      user,
      shallow !== 1,
      shallow !== 1,
    );
    return SetDto.fromEntity(entity);
  }

  @Get(':id/export')
  @UseGuards(JWTGuard)
  async exportSet(
    @Param('id') id: string,
    @User() user: UserEntity,
    @Query('includeReviews', new DefaultValuePipe('0'), ParseIntPipe)
    includeReviews,
  ): Promise<any> {
    return this.setsService.exportSet(id, user, includeReviews === 1);
  }

  @Post('import')
  @UseGuards(JWTGuard)
  async importSet(
    @Body() set: SetExportV1,
    @User() user: UserEntity,
    @Query('includeReviews', new DefaultValuePipe('0'), ParseIntPipe)
    includeReviews,
  ): Promise<SetDto> {
    const entity = await this.setsService.importSet(
      set,
      user,
      includeReviews === 1,
    );
    return SetDto.fromEntity(entity);
  }

  @Post()
  @UseGuards(JWTGuard)
  async postSet(
    @Body() set: CreateOrUpdateSetDto,
    @User() user: UserEntity,
  ): Promise<SetDto> {
    const entity = await this.setsService.create(user.id, set);
    return SetDto.fromEntity(entity);
  }

  @Put(':id')
  @UseGuards(JWTGuard)
  async putSet(
    @Param('id') id: string,
    @Body() set: CreateOrUpdateSetDto,
    @User() user: UserEntity,
  ): Promise<SetDto> {
    const entity = await this.setsService.update(id, set, user);
    return SetDto.fromEntity(entity);
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  async deleteSet(@Param('id') id, @User() user: UserEntity) {
    await this.setsService.removeById(id, user);
    return { success: true };
  }
}
