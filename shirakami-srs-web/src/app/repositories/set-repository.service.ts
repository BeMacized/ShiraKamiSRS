import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettingsService } from '../services/app-settings.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { map, switchMap, take } from 'rxjs/operators';
import { CreateSetDto, SetDto } from '../models/set.model';

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

    public createSet(data: CreateSetDto): Observable<SetDto> {
        return this.getApiUrl(`/sets`).pipe(
            switchMap((url) => this.http.post<SetDto>(url, data))
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
