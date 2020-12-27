import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entities/card.entity';
import { SetsModule } from '../sets.module';
import { SrsLevelEntity } from './entities/srs-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity, SrsLevelEntity]), SetsModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
