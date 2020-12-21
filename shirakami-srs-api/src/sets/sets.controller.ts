import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BaseSetDTO, SetDTO } from './dtos/set.dto';
import { SetsService } from './sets.service';

@Controller()
export class SetsController {
  constructor(private readonly setsService: SetsService) {}

  @Get()
  async getAllSets(): Promise<SetDTO[]> {
    return this.setsService
      .findAll()
      .then((sets) => sets.map(SetDTO.fromEntity));
  }

  @Get(':id')
  async getSet(@Param('id') id: string): Promise<SetDTO> {
    const entity = await this.setsService.findOneById(id);
    if (!entity) throw new NotFoundException();
    return SetDTO.fromEntity(entity);
  }

  @Post()
  async postSet(@Body() set: BaseSetDTO): Promise<SetDTO> {
    const entity = await this.setsService.create(set);
    return SetDTO.fromEntity(entity);
  }

  @Put(':id')
  async putSet(
    @Param('id') id: string,
    @Body() set: BaseSetDTO,
  ): Promise<SetDTO> {
    const entity = await this.setsService.update(id, set);

    return SetDTO.fromEntity(entity);
  }

  @Delete(':id')
  async deleteSet(@Param('id') id) {
    await this.setsService.removeById(id);
    return { success: true };
  }
}
