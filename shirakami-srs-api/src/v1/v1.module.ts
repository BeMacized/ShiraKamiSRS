import { Module } from '@nestjs/common';
import { SetsModule } from './sets/sets.module';
import { CardsModule } from './sets/cards/cards.module';
import { UsersModule } from './users/users.module';
import { V1Controller } from './v1.controller';
import { AuthenticationModule } from './authentication/authentication.module';
import { ReviewsModule } from './reviews/reviews.module';
import { LessonsModule } from './lessons/lessons.module';
import { CommonModule } from './common/common.module';
import { SetRepositoriesModule } from './set-repositories/set-repositories.module';

@Module({
  imports: [
    SetsModule,
    CardsModule,
    UsersModule,
    AuthenticationModule,
    ReviewsModule,
    LessonsModule,
    CommonModule,
    SetRepositoriesModule,
  ],
  controllers: [V1Controller],
  providers: [],
})
export class V1Module {}
