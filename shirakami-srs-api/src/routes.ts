import { Routes } from 'nest-router';
import { SetsModule } from './v1/sets/sets.module';
import { CardsModule } from './v1/sets/cards/cards.module';
import { V1Module } from './v1/v1.module';
import { AuthenticationModule } from './v1/authentication/authentication.module';
import { UsersModule } from './v1/users/users.module';

export const APP_ROUTES: Routes = [
  {
    path: '/api/v1',
    module: V1Module,
    children: [
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
    ],
  },
];
