import { Injectable } from '@angular/core';
import { AppSettingsService } from '../services/app-settings.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ReviewDto, ReviewMode, ReviewSetDto } from '../models/review.model';

@Injectable({
    providedIn: 'root',
})
export class ReviewRepositoryService {
    constructor(
        private appSettings: AppSettingsService,
        private http: HttpClient
    ) {}

    public getAvailableReviews(options: { timespan?: number, setId?: string } = {}): Observable<ReviewSetDto> {
        let params = new HttpParams();
        if (options.timespan) params = params.append('timespan', options.timespan.toString());
        if (options.setId) params = params.append('setId', options.setId);
        return this.getApiUrl(`/reviews`).pipe(
            switchMap((url) => this.http.get<ReviewSetDto>(url, { params }))
        );
    }

    public submitReview(
        reviewId: string,
        score: number
    ): Observable<ReviewDto> {
        return this.getApiUrl(`/reviews/${reviewId}/submit`).pipe(
            switchMap((url) => this.http.post<ReviewDto>(url, { score }))
        );
    }

    public createReview(
        cardId: string,
        mode: ReviewMode
    ): Observable<ReviewDto> {
        return this.getApiUrl(`/reviews`).pipe(
            switchMap((url) => this.http.post<ReviewDto>(url, { cardId, mode }))
        );
    }

    private getApiUrl(resource: string) {
        return this.appSettings.appSettings.pipe(
            take(1),
            map(
                (appSettings) =>
                    `${appSettings.apiBaseUrl}${
                        resource.startsWith('/') ? resource : '/' + resource
                    }`
            )
        );
    }
}
