import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(
        request: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        const tokenSet = this.authService.getTokenSet();
        if (tokenSet) {
            request = request.clone({
                headers: request.headers.append(
                    'Authorization',
                    'Bearer ' + tokenSet.accessToken
                ),
            });
        }
        return next.handle(request);
    }
}
