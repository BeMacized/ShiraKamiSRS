import { Routes } from 'nest-router';
import { SetsModule } from './sets/sets.module';
import { CardsModule } from './sets/cards/cards.module';

export const APP_ROUTES: Routes = [
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
];
