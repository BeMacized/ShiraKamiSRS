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
import { CardDTO, CreateCardDTO, UpdateCardDTO } from './dtos/card.dto';
import { CardsService } from './cards.service';
import { JWTGuard } from '../../authentication/guards/jwt.guard';
import { UserEntity } from '../../users/entities/user.entity';
import { User } from '../../common/user.decorator';

@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async getAllCards(
    @Param('setId') setId: string,
    @User() user: UserEntity,
  ): Promise<CardDTO[]> {
    return this.cardsService
      .findBySetId(setId, user.id)
      .then((cards) => cards.map(CardDTO.fromEntity));
  }

  @Get(':id')
  @UseGuards(JWTGuard)
  async getCard(
    @Param('id') id: string,
    @User() user: UserEntity,
  ): Promise<CardDTO> {
    const entity = await this.cardsService.findOneById(id, user.id);
    if (!entity) throw new NotFoundException();
    return CardDTO.fromEntity(entity);
  }

  @Post()
  @UseGuards(JWTGuard)
  async postCard(
    @Param('setId') setId: string,
    @Body() card: CreateCardDTO,
    @User() user: UserEntity,
  ): Promise<CardDTO> {
    const entity = await this.cardsService.create(
      {
        ...card,
        setId,
        levelLastChanged: new Date(
          (card.levelLastChanged || 0) * 1000 || Date.now(),
        ),
        srsLevel: card.srsLevel || 0,
      },
      user.id,
    );
    return CardDTO.fromEntity(entity);
  }

  @Put(':id')
  @UseGuards(JWTGuard)
  async putCard(
    @Param('setId') setId: string,
    @Param('id') id: string,
    @Body() card: UpdateCardDTO,
    @User() user: UserEntity,
  ): Promise<CardDTO> {
    const entity = await this.cardsService.update(
      id,
      {
        ...card,
        setId,
        levelLastChanged: new Date(
          (card.levelLastChanged || 0) * 1000 || Date.now(),
        ),
        srsLevel: card.srsLevel || 0,
      },
      user.id,
    );
    return CardDTO.fromEntity(entity);
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  async deleteSet(@Param('id') id, @User() user: UserEntity) {
    await this.cardsService.removeById(id, user.id);
    return { success: true };
  }
}
