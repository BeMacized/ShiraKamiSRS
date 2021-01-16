import { Injectable } from '@angular/core';
import { AppSettingsService } from '../services/app-settings.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ReviewDto } from '../models/review.model';

@Injectable({
    providedIn: 'root',
})
export class ReviewRepositoryService {
    constructor(
        private appSettings: AppSettingsService,
        private http: HttpClient
    ) {}

    public getAvailableReviews(timespan?: number): Observable<ReviewDto[]> {
        const params = new HttpParams();
        if (timespan) params.append('timespan', timespan.toString());
        return this.getApiUrl(`/reviews`).pipe(
            switchMap((url) => this.http.get<ReviewDto[]>(url, { params }))
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
