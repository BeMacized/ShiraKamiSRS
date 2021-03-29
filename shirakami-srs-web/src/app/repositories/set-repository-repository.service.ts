import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LessonSetDto } from '../models/lesson.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, switchMap, take } from 'rxjs/operators';
import {
    SetRepositoryDto,
    SetRepositoryEntity,
} from '../models/set-repository.model';
import { AppSettingsService } from '../services/app-settings.service';
import { SetRepositoryIndexDto } from '../models/set-repository-index.model';

@Injectable({
    providedIn: 'root',
})
export class SetRepositoryRepositoryService {
    constructor(
        private appSettings: AppSettingsService,
        private http: HttpClient
    ) {}

    public getSetRepositories(): Observable<SetRepositoryDto[]> {
        return this.getApiUrl(`/setrepositories`).pipe(
            switchMap((url) => this.http.get<SetRepositoryDto[]>(url))
        );
    }

    public removeSetRepository(repositoryId: string): Observable<void> {
        return this.getApiUrl(`/setrepositories/${repositoryId}`).pipe(
            switchMap((url) => this.http.delete<void>(url))
        );
    }

    public addSetRepository(indexUrl: string): Observable<SetRepositoryDto> {
        return this.getApiUrl(`/setrepositories`).pipe(
            switchMap((url) =>
                this.http.post<SetRepositoryDto>(url, { indexUrl })
            )
        );
    }

    public getSetRepositoryIndex(
        repoId: string
    ): Observable<SetRepositoryIndexDto> {
        return this.getApiUrl(`/setrepositories/${repoId}/index`).pipe(
            switchMap((url) => this.http.get<SetRepositoryIndexDto>(url))
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
