import { Injectable } from '@angular/core';
import { ReviewRepositoryService } from '../repositories/review-repository.service';
import { ReviewEntity, ReviewMode } from '../models/review.model';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';

@Injectable({
    providedIn: 'root',
})
export class ReviewService {
    constructor(private reviewRepository: ReviewRepositoryService) {}

    async getAvailableReviews(
        options: { timespan?: number; setId?: string } = {}
    ): Promise<ReviewEntity[]> {
        try {
            return await this.reviewRepository
                .getAvailableReviews(options)
                .pipe(
                    map((reviewSet) =>
                        reviewSet.reviews.map((dto) =>
                            ReviewEntity.fromDto(
                                dto,
                                reviewSet.cards,
                                reviewSet.sets
                            )
                        )
                    )
                )
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

    async createReview(
        cardId: string,
        mode: ReviewMode
    ): Promise<ReviewEntity> {
        try {
            return await this.reviewRepository
                .createReview(cardId, mode)
                .pipe(map((dto) => ReviewEntity.fromDto(dto)))
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

    async submitReview(reviewId: string, score: number): Promise<ReviewEntity> {
        try {
            return await this.reviewRepository
                .submitReview(reviewId, score)
                .pipe(map((dto) => ReviewEntity.fromDto(dto)))
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
