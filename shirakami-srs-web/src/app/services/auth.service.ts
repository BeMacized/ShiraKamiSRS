import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
    StoredTokenSet,
    TokenSet,
    TokenSetSchema,
} from '../models/token-set.model';
import { delay, filter, map, switchMap } from 'rxjs/operators';
import { AuthRepositoryService } from '../repositories/auth-repository.service';
import jwt_decode from 'jwt-decode';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { AuthResponseDto } from '../models/auth.model';

const TOKEN_SET_KEY = 'AUTH_TOKEN_SET';
const ACCESS_TOKEN_REFRESH_PERIOD = 1000 * 60 * 5;

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly tokenSet: BehaviorSubject<TokenSet> = new BehaviorSubject<TokenSet>(
        null
    );
    public readonly loggedIn: Observable<boolean> = this.tokenSet.pipe(
        map((set) => !!set)
    );

    constructor(
        private storage: StorageMap,
        private authRepository: AuthRepositoryService,
        private userService: UserService,
        private router: Router
    ) {
        this.handleAutoTokenRefresh();
    }

    public async init() {
        try {
            if (await this.loadTokenSet()) await this.userService.refreshUser();
        } catch (e) {
            await this.logout();
        }
    }

    public getTokenSet(): TokenSet {
        return this.tokenSet.value;
    }

    public async login(email: string, password: string) {
        if (this.isLoggedInSync()) await this.logout();
        try {
            // Attempt a log in
            const resp = await this.authRepository
                .login(email, password)
                .toPromise();
            // Extract a token set from the response
            const tokenSet = this.getTokenSetFromLoginResponse(resp);
            // Persist the token set
            await this.saveTokenSet(tokenSet);
            // Set the token set as the current set
            this.tokenSet.next(tokenSet);
        } catch (e) {
            await this.logout();
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 429:
                        throw new ServiceError('RATE_LIMITED');
                    case 403:
                    case 401:
                        throw new ServiceError(e.error.error);
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw e;
        }
        try {
            // Retrieve the user
            await this.userService.refreshUser();
        } catch (e) {
            await this.logout();
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw e;
        }
    }

    async register(
        email: string,
        username: string,
        password: string
    ): Promise<{
        needsEmailVerification: boolean;
    }> {
        try {
            const {
                needsEmailVerification,
            } = await this.authRepository
                .register(email, username, password)
                .toPromise();
            return { needsEmailVerification };
        } catch (e) {
            if (e instanceof HttpErrorResponse) {
                switch (e.status) {
                    case 400:
                        throw new ServiceError('INVALID_REGISTRATION_DATA');
                    case 429:
                        throw new ServiceError('RATE_LIMITED');
                    case 409:
                    case 500:
                        if (
                            [
                                'EMAIL_EXISTS',
                                'USERNAME_USED_TOO_OFTEN',
                                'MAILER_FAILED',
                            ].includes(e.error.error)
                        )
                            throw new ServiceError(e.error.error);
                        break;
                    case 0:
                        throw new ServiceError('SERVICE_UNAVAILABLE');
                }
            }
            throw e;
        }
    }

    public async logout(): Promise<void> {
        this.tokenSet.next(null);
        await this.userService.clearUser();
        await this.storage.delete(TOKEN_SET_KEY).toPromise();
        await this.router.navigate(['login']);
    }

    public isLoggedInSync(): boolean {
        return !!this.tokenSet.value;
    }

    private handleAutoTokenRefresh() {
        this.tokenSet
            .pipe(
                switchMap((tokenSet) => {
                    if (!tokenSet) return of(null);
                    const refreshDelay = Math.max(
                        0,
                        tokenSet.accessTokenExpiry.getTime() -
                            Date.now() -
                            ACCESS_TOKEN_REFRESH_PERIOD
                    );
                    return of(tokenSet).pipe(delay(refreshDelay));
                }),
                filter((tokenSet) => !!tokenSet)
            )
            .subscribe((tokenSet: TokenSet) => this.refreshTokens(tokenSet));
    }

    private async refreshTokens(tokenSet: TokenSet): Promise<TokenSet> {
        try {
            const resp = await this.authRepository
                .refresh(tokenSet.accessToken, tokenSet.refreshToken)
                .toPromise();
            const newTokens = this.getTokenSetFromLoginResponse(resp);
            this.tokenSet.next(newTokens);
            await this.saveTokenSet(newTokens);
            return newTokens;
        } catch (e) {
            // TODO: Tell user that their login expired.
            await this.logout();
            return null;
        }
    }

    private async loadTokenSet(): Promise<TokenSet> {
        if (!(await this.storage.has(TOKEN_SET_KEY).toPromise())) return null;
        // Get token set from storage
        const tokenSetData: StoredTokenSet = await this.storage
            .get<StoredTokenSet>(TOKEN_SET_KEY, TokenSetSchema)
            .toPromise();
        const tokenSet: TokenSet = {
            accessToken: tokenSetData.accessToken,
            accessTokenExpiry: new Date(tokenSetData.accessTokenExpiry),
            refreshToken: tokenSetData.refreshToken,
            refreshTokenExpiry: new Date(tokenSetData.refreshTokenExpiry),
        };
        // Check if the access token is about to expire
        if (
            tokenSet.accessTokenExpiry.getTime() - Date.now() <
            ACCESS_TOKEN_REFRESH_PERIOD
        ) {
            // Check if the refresh token is still valid
            if (tokenSet.refreshTokenExpiry.getTime() - Date.now() > 0) {
                // Attempt to refresh the token set
                return this.refreshTokens(tokenSet);
            }
            // If not, log out
            else {
                // TODO: Tell user that their login expired.
                await this.logout();
                return null;
            }
        }
        // If it's not about to expire, just load it normally
        else {
            // Activate the token set and return it
            this.tokenSet.next(tokenSet);
            return tokenSet;
        }
    }

    private async saveTokenSet(tokenSet: TokenSet): Promise<void> {
        await this.storage
            .set(
                TOKEN_SET_KEY,
                {
                    accessToken: tokenSet.accessToken,
                    refreshToken: tokenSet.refreshToken,
                    refreshTokenExpiry: tokenSet.refreshTokenExpiry.getTime(),
                    accessTokenExpiry: tokenSet.accessTokenExpiry.getTime(),
                },
                TokenSetSchema
            )
            .toPromise();
    }

    private getTokenSetFromLoginResponse(resp: AuthResponseDto): TokenSet {
        const { exp: accessExp } = jwt_decode(resp.accessToken) as any;
        const { exp: refreshExp } = jwt_decode(resp.refreshToken) as any;
        return {
            accessToken: resp.accessToken,
            accessTokenExpiry: new Date(accessExp * 1000),
            refreshToken: resp.refreshToken,
            refreshTokenExpiry: new Date(refreshExp * 1000),
        };
    }
}
