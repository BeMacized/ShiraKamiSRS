import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppSettingsService } from '../services/app-settings.service';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { CreateSetDto, SetDto, UpdateSetDto } from '../models/set.model';

@Injectable({
    providedIn: 'root',
})
export class SetRepositoryService {
    constructor(
        private http: HttpClient,
        private appSettings: AppSettingsService
    ) {}

    public getSets(): Observable<SetDto[]> {
        return this.getApiUrl(`/sets`).pipe(
            switchMap((url) => this.http.get<SetDto[]>(url))
        );
    }

    public getSet(setId: string, shallow: boolean = false): Observable<SetDto> {
        let params = new HttpParams();
        if (shallow) params = params.append('shallow', '1');
        return this.getApiUrl(`/sets/${setId}`).pipe(
            switchMap((url) => this.http.get<SetDto>(url, { params }))
        );
    }

    public createSet(data: CreateSetDto): Observable<SetDto> {
        return this.getApiUrl(`/sets`).pipe(
            switchMap((url) => this.http.post<SetDto>(url, data))
        );
    }

    public updateSet(data: UpdateSetDto): Observable<SetDto> {
        return this.getApiUrl(`/sets/${data.id}`).pipe(
            switchMap((url) => this.http.put<SetDto>(url, data))
        );
    }

    public deleteSet(id: string): Observable<void> {
        return this.getApiUrl(`/sets/${id}`).pipe(
            switchMap((url) => this.http.delete<void>(url))
        );
    }

    public exportSet(id: string, includeReviews = false): Observable<string> {
        let params = new HttpParams();
        if (includeReviews) params = params.append('includeReviews', '1');
        return this.getApiUrl(`/sets/${id}/export`).pipe(
            switchMap((url) =>
                this.http.get(url, { responseType: 'text', params })
            )
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
