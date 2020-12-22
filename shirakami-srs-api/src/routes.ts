import { Routes } from 'nest-router';
import { SetsModule } from './v1/sets/sets.module';
import { CardsModule } from './v1/sets/cards/cards.module';
import { V1Module } from './v1/v1.module';
import { AuthenticationModule } from './v1/authentication/authentication.module';

export const APP_ROUTES: Routes = [
  {
    path: '/v1',
    module: V1Module,
    children: [
      {
        path: '/auth',
        module: AuthenticationModule,
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
