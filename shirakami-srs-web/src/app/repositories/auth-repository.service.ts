import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap, take } from 'rxjs/operators';
import { AppSettingsService } from '../services/app-settings.service';
import { Observable } from 'rxjs';
import { AuthResponseDto, RegisterResponseDto } from '../models/auth.model';

@Injectable({
    providedIn: 'root',
})
export class AuthRepositoryService {
    constructor(
        private http: HttpClient,
        private appSettings: AppSettingsService
    ) {}

    public login(email: string, password: string): Observable<AuthResponseDto> {
        return this.getApiUrl(`/auth/login`).pipe(
            switchMap((url) =>
                this.http.post<AuthResponseDto>(url, {
                    email,
                    password,
                })
            )
        );
    }

    public register(
        email: string,
        username: string,
        password: string
    ): Observable<RegisterResponseDto> {
        return this.getApiUrl(`/auth/register`).pipe(
            switchMap((url) =>
                this.http.post<RegisterResponseDto>(url, {
                    email,
                    username,
                    password,
                })
            )
        );
    }

    public refresh(
        accessToken: string,
        refreshToken: string
    ): Observable<AuthResponseDto> {
        return this.getApiUrl(`/auth/refresh`).pipe(
            switchMap((url) =>
                this.http.post<AuthResponseDto>(url, {
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
