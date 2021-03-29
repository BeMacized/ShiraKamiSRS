import { HttpModule, Module } from '@nestjs/common';
import { SetRepositoriesController } from './set-repositories.controller';
import { SetRepositoriesService } from './set-repositories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetRepositoryEntity } from './entities/set-repository.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SetRepositoryEntity]),
    UsersModule,
    HttpModule,
  ],
  controllers: [SetRepositoriesController],
  providers: [SetRepositoriesService],
})
export class SetRepositoriesModule {}
