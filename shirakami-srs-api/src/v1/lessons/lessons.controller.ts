import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JWTGuard } from '../authentication/guards/jwt.guard';
import { User } from '../common/user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { LessonsService } from './lessons.service';

@Controller()
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async debug(
    @User() user: UserEntity,
    @Query('limit', new DefaultValuePipe(5)) limit: number,
    @Query('setId') setId: string,
  ) {
    limit = Math.min(Math.max(limit, 0), 50);
    return this.lessonsService.fetchLessons(user.id, setId, limit);
  }
}
