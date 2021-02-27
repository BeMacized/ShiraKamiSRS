import { forwardRef, Module } from '@nestjs/common';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetEntity } from './entities/set.entity';
import { UsersModule } from '../users/users.module';
import { CardEntity } from './cards/entities/card.entity';
import { ReviewEntity } from '../reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SetEntity, CardEntity, ReviewEntity]),
    UsersModule,
  ],
  controllers: [SetsController],
  providers: [SetsService],
  exports: [SetsService],
})
export class SetsModule {}
