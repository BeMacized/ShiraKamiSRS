import { Injectable } from '@nestjs/common';
import { ReviewDto, ReviewMode, ReviewModes } from './dtos/review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import * as moment from 'moment';
import 'moment-round';
import { ReviewEntity } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
  ) {}

  public async getAvailableReviews(
    user: UserEntity,
    timespan = 3600,
  ): Promise<ReviewEntity[]> {
    const endTime = moment().startOf('hour').unix() + timespan;
    return await this.reviewRepository.find({
      where: {
        creationDate: LessThanOrEqual(`datetime(${endTime}, \'unixepoch\')`),
      },
    });
  }
}
