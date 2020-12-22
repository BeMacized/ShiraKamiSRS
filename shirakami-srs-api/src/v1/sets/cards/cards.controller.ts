import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put, UseGuards
} from "@nestjs/common";
import { BaseCardDTO, CardDTO } from './dtos/card.dto';
import { CardsService } from './cards.service';
import { JWTGuard } from "../../authentication/guards/jwt.guard";

@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async getAllCards(@Param('setId') setId: string): Promise<CardDTO[]> {
    return this.cardsService
      .findBySetId(setId)
      .then((cards) => cards.map(CardDTO.fromEntity));
  }

  @Get(':id')
  @UseGuards(JWTGuard)
  async getCard(@Param('id') id: string): Promise<CardDTO> {
    const entity = await this.cardsService.findOneById(id);
    if (!entity) throw new NotFoundException();
    return CardDTO.fromEntity(entity);
  }

  @Post()
  @UseGuards(JWTGuard)
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
  @UseGuards(JWTGuard)
  async putCard(
    @Param('id') id: string,
    @Body() card: BaseCardDTO,
  ): Promise<CardDTO> {
    const entity = await this.cardsService.update(id, card);
    return CardDTO.fromEntity(entity);
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  async deleteSet(@Param('id') id) {
    await this.cardsService.removeById(id);
    return { success: true };
  }
}
