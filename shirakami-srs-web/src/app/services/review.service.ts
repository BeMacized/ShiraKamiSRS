import { Injectable } from '@angular/core';
import { ReviewRepositoryService } from '../repositories/review-repository.service';
import { ReviewEntity } from '../models/review.model';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';

@Injectable({
    providedIn: 'root',
})
export class ReviewService {
    constructor(private reviewRepository: ReviewRepositoryService) {}

    async getAvailableReviews(timespan?: number): Promise<ReviewEntity[]> {
        try {
            return await this.reviewRepository
                .getAvailableReviews(timespan)
                .pipe(map((dtos) => dtos.map(ReviewEntity.fromDto)))
                .toPromise();
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw e;
        }
    }
}
