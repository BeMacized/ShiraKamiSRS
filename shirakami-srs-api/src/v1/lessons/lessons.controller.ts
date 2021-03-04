import {
  Controller,
  DefaultValuePipe,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JWTGuard } from '../authentication/guards/jwt.guard';
import { User } from '../common/decorators/user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { LessonsService } from './lessons.service';
import { LessonSetDto } from './dtos/lesson.dto';

@Controller()
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async getLessons(
    @User() user: UserEntity,
    @Query('limit', new DefaultValuePipe(5)) limit: number,
    @Query('setId') setId: string,
  ): Promise<LessonSetDto> {
    limit = Math.min(Math.max(limit, 0), 50);
    return this.lessonsService.fetchLessons(user.id, setId, limit);
  }
}
