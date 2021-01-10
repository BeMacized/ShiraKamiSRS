import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettingsService } from '../services/app-settings.service';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class UserRepositoryService {
    constructor(
        private http: HttpClient,
        private appSettings: AppSettingsService
    ) {}

    public getMe(): Observable<User> {
        return this.getApiUrl(`/users/me`).pipe(
            switchMap((url) => this.http.get<User>(url))
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
