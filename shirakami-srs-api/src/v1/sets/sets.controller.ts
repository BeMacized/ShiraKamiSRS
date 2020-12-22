import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BaseSetDTO, SetDTO } from './dtos/set.dto';
import { SetsService } from './sets.service';
import { JWTGuard } from '../authentication/guards/jwt.guard';

@Controller()
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async getAllSets(): Promise<SetDTO[]> {
    return this.setsService
      .findAll()
      .then((sets) => sets.map(SetDTO.fromEntity));
  }

  @Get(':id')
  @UseGuards(JWTGuard)
  async getSet(@Param('id') id: string): Promise<SetDTO> {
    const entity = await this.setsService.findOneById(id);
    if (!entity) throw new NotFoundException();
    return SetDTO.fromEntity(entity);
  }

  @Post()
  @UseGuards(JWTGuard)
  async postSet(@Body() set: BaseSetDTO): Promise<SetDTO> {
    const entity = await this.setsService.create(set);
    return SetDTO.fromEntity(entity);
  }

  @Put(':id')
  @UseGuards(JWTGuard)
  async putSet(
    @Param('id') id: string,
    @Body() set: BaseSetDTO,
  ): Promise<SetDTO> {
    const entity = await this.setsService.update(id, set);

    return SetDTO.fromEntity(entity);
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  async deleteSet(@Param('id') id) {
    await this.setsService.removeById(id);
    return { success: true };
  }
}
