import { Routes } from 'nest-router';
import { SetsModule } from './v1/sets/sets.module';
import { CardsModule } from './v1/sets/cards/cards.module';
import { V1Module } from './v1/v1.module';
import { AuthenticationModule } from './v1/authentication/authentication.module';
import { UsersModule } from './v1/users/users.module';
import { ReviewsModule } from './v1/reviews/reviews.module';
import { LessonsModule } from './v1/lessons/lessons.module';
import { SetRepositoriesModule } from './v1/set-repositories/set-repositories.module';

export const APP_ROUTES: Routes = [
  {
    path: '/api/v1',
    module: V1Module,
    children: [
      {
        path: '/reviews',
        module: ReviewsModule,
      },
      {
        path: '/lessons',
        module: LessonsModule,
      },
      {
        path: '/auth',
        module: AuthenticationModule,
      },
      {
        path: '/users',
        module: UsersModule,
      },
      {
        path: '/sets',
        module: SetsModule,
        children: [
          {
            path: ':setId/cards',
            module: CardsModule,
          },
        ],
      },
      {
        path: '/setrepositories',
        module: SetRepositoriesModule,
      },
    ],
  },
];
