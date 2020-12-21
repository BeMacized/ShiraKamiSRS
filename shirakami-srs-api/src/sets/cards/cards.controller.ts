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
import { BaseCardDTO, CardDTO } from './dtos/card.dto';
import { CardsService } from './cards.service';

@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  async getAllCards(@Param('setId') setId: string): Promise<CardDTO[]> {
    return this.cardsService
      .findBySetId(setId)
      .then((cards) => cards.map(CardDTO.fromEntity));
  }

  @Get(':id')
  async getCard(@Param('id') id: string): Promise<CardDTO> {
    const entity = await this.cardsService.findOneById(id);
    if (!entity) throw new NotFoundException();
    return CardDTO.fromEntity(entity);
  }

  @Post()
  async postCard(
    @Param('setId') setId: string,
    @Body() card: BaseCardDTO,
  ): Promise<CardDTO> {
    const entity = await this.cardsService.create({
      ...card,
      setId,
      srsLevel: 0,
      levelLastChanged: new Date(),
    });
    return CardDTO.fromEntity(entity);
  }

  @Put(':id')
  async putCard(
    @Param('id') id: string,
    @Body() card: BaseCardDTO,
  ): Promise<CardDTO> {
    const entity = await this.cardsService.update(id, card);
    return CardDTO.fromEntity(entity);
  }

  @Delete(':id')
  async deleteSet(@Param('id') id) {
    await this.cardsService.removeById(id);
    return { success: true };
  }
}
