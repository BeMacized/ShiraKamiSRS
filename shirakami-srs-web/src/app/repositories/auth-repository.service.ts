import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, take } from 'rxjs/operators';
import { AppSettingsService } from '../services/app-settings.service';
import { Observable } from 'rxjs';

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthRepositoryService {
    constructor(
        private http: HttpClient,
        private appSettings: AppSettingsService
    ) {}

    public login(email: string, password: string): Observable<AuthResponse> {
        return this.getApiUrl(`/auth/login`).pipe(
            switchMap((url) =>
                this.http.post<AuthResponse>(url, {
                    email,
                    password,
                })
            )
        );
    }

    public refresh(
        accessToken: string,
        refreshToken: string
    ): Observable<AuthResponse> {
        return this.getApiUrl(`/auth/refresh`).pipe(
            switchMap((url) =>
                this.http.post<AuthResponse>(url, {
                    accessToken,
                    refreshToken,
                })
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
