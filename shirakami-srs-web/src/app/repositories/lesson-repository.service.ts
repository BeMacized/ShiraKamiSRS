import { Injectable } from '@angular/core';
import { AppSettingsService } from '../services/app-settings.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewDto } from '../models/review.model';
import { map, switchMap, take } from 'rxjs/operators';
import { LessonSetDto } from '../models/lesson.model';

@Injectable({
    providedIn: 'root',
})
export class LessonRepositoryService {
    constructor(
        private appSettings: AppSettingsService,
        private http: HttpClient
    ) {}

    public getLessons(
        setId?: string,
        limit?: number
    ): Observable<LessonSetDto> {
        let params = new HttpParams();
        if (setId) params = params.append('setId', setId);
        if (limit) params = params.append('limit', limit.toString());
        return this.getApiUrl(`/lessons`).pipe(
            switchMap((url) => this.http.get<LessonSetDto>(url, { params }))
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
