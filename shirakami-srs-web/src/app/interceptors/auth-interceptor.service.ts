import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AppSettingsService } from '../services/app-settings.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    apiBaseUrl: string;

    constructor(
        private authService: AuthService,
        private appSettingsService: AppSettingsService
    ) {
        appSettingsService
            .get<string>('apiBaseUrl')
            .then((apiBaseUrl) => (this.apiBaseUrl = apiBaseUrl));
    }

    intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        if (!this.apiBaseUrl) return next.handle(request);
        if (this.includeAuthorizationHeader(request.url)) {
            const tokenSet = this.authService.getTokenSet();
            if (tokenSet) {
                request = request.clone({
                    headers: request.headers.append(
                        'Authorization',
                        'Bearer ' + tokenSet.accessToken
                    ),
                });
            }
        }
        return next.handle(request);
    }

    includeAuthorizationHeader(requestUrl: string): boolean {
        // Internal
        if (requestUrl.startsWith('/')) return true;
        // Same base url
        if (
            this.apiBaseUrl.startsWith('https://') ||
            this.apiBaseUrl.startsWith('http://')
        ) {
            if (requestUrl.startsWith(this.apiBaseUrl)) return true;
        }
        // Front origin
        if (requestUrl.startsWith(document.location.origin)) return true;
        // Otherwise, don't authorize
        return false;
    }
}
