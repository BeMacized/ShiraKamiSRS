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
import { CardDto, CreateOrUpdateCardDto } from './dtos/card.dto';
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
  ): Promise<CardDto[]> {
    return this.cardsService
      .findBySetId(setId, user.id)
      .then((cards) => cards.map(CardDto.fromEntity));
  }

  @Get(':id')
  @UseGuards(JWTGuard)
  async getCard(
    @Param('id') id: string,
    @User() user: UserEntity,
  ): Promise<CardDto> {
    const entity = await this.cardsService.findOneById(id, user.id);
    if (!entity) throw new NotFoundException();
    return CardDto.fromEntity(entity);
  }

  @Post()
  @UseGuards(JWTGuard)
  async postCard(
    @Param('setId') setId: string,
    @Body() card: CreateOrUpdateCardDto,
    @User() user: UserEntity,
  ): Promise<CardDto> {
    const entity = await this.cardsService.create(
      {
        ...card,
        setId,
      },
      user.id,
    );
    return CardDto.fromEntity(entity);
  }

  @Put(':id')
  @UseGuards(JWTGuard)
  async putCard(
    @Param('setId') setId: string,
    @Param('id') id: string,
    @Body() card: CreateOrUpdateCardDto,
    @User() user: UserEntity,
  ): Promise<CardDto> {
    const entity = await this.cardsService.update(
      id,
      {
        ...card,
        setId,
      },
      user.id,
    );
    return CardDto.fromEntity(entity);
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  async deleteCard(@Param('id') id, @User() user: UserEntity) {
    await this.cardsService.removeById(id, user.id);
    return { success: true };
  }
}
