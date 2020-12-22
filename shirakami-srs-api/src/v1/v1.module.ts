import { Module } from '@nestjs/common';
import { SetsModule } from './sets/sets.module';
import { CardsModule } from './sets/cards/cards.module';
import { UsersModule } from './users/users.module';
import { V1Controller } from './v1.controller';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [SetsModule, CardsModule, UsersModule, AuthenticationModule],
  controllers: [V1Controller],
  providers: [],
})
export class V1Module {}
