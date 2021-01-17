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

@Controller()
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async getAllSets(@User() user: UserEntity): Promise<SetDto[]> {
    return this.setsService
      .findAll(user.id)
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
      user.id,
      shallow !== 1,
    );
    return SetDto.fromEntity(entity);
  }

  @Post()
  @UseGuards(JWTGuard)
  async postSet(
    @Body() set: CreateOrUpdateSetDto,
    @User() user: UserEntity,
  ): Promise<SetDto> {
    const entity = await this.setsService.create({ ...set, userId: user.id });
    return SetDto.fromEntity(entity);
  }

  @Put(':id')
  @UseGuards(JWTGuard)
  async putSet(
    @Param('id') id: string,
    @Body() set: CreateOrUpdateSetDto,
    @User() user: UserEntity,
  ): Promise<SetDto> {
    const entity = await this.setsService.update(id, {
      ...set,
      userId: user.id,
    });

    return SetDto.fromEntity(entity);
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  async deleteSet(@Param('id') id, @User() user: UserEntity) {
    await this.setsService.removeById(id, user.id);
    return { success: true };
  }
}
