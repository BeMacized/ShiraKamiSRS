import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    public getSet(setId: string): Observable<SetDto> {
        return this.getApiUrl(`/sets/${setId}`).pipe(
            switchMap((url) => this.http.get<SetDto>(url))
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
