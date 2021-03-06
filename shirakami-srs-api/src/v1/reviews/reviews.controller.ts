import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JWTGuard } from '../authentication/guards/jwt.guard';
import { User } from '../common/decorators/user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  ReviewDto,
  ReviewSetDto,
  SubmitReviewDto,
} from './dtos/review.dto';

@Controller()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  @UseGuards(JWTGuard)
  async getReviews(
    @User() user: UserEntity,
    @Query('timespan', new DefaultValuePipe(3600), ParseIntPipe)
    timespan: number,
    @Query('setId') setId: string,
  ): Promise<ReviewSetDto> {
    return this.reviewsService.getAvailableReviews(user, timespan, setId);
  }

  @Get(':id')
  @UseGuards(JWTGuard)
  async getReview(
    @User() user: UserEntity,
    @Param('id') id: string,
  ): Promise<ReviewDto> {
    const entity = await this.reviewsService.findOneById(id, user.id);
    return ReviewDto.fromEntity(entity);
  }

  @Post()
  @UseGuards(JWTGuard)
  async createReview(
    @User() user: UserEntity,
    @Body() review: CreateReviewDto,
  ): Promise<ReviewDto> {
    return this.reviewsService
      .createReview(user, review.mode, review.cardId)
      .then((review) => ReviewDto.fromEntity(review));
  }

  @Post(':id/submit')
  @UseGuards(JWTGuard)
  async submitReview(
    @Param('id') id: string,
    @User() user: UserEntity,
    @Body() submission: SubmitReviewDto,
  ): Promise<ReviewDto> {
    return this.reviewsService
      .submitReview(user, id, submission.score)
      .then((review) => ReviewDto.fromEntity(review));
  }
}
