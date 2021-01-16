import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JWTGuard } from '../authentication/guards/jwt.guard';
import { User } from '../common/user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async debug(
    @User() user: UserEntity,
    @Query('timespan', new DefaultValuePipe(3600), ParseIntPipe) timespan,
  ) {
    return this.reviewsService.getAvailableReviews(user, timespan);
  }
}
