import { Module } from '@nestjs/common';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetEntity } from './entities/set.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SetEntity])],
  controllers: [SetsController],
  providers: [SetsService],
  exports: [SetsService],
})
export class SetsModule {}
