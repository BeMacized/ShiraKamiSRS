import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    StoredTokenSet,
    TokenSet,
    TokenSetSchema,
} from '../models/token-set.model';
import { map } from 'rxjs/operators';
import {
    AuthLoginResponse,
    AuthRepositoryService,
} from '../repositories/auth-repository.service';
import jwt_decode from 'jwt-decode';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';
import { UserService } from './user.service';
import { Router } from '@angular/router';

const TOKEN_SET_KEY = 'AUTH_TOKEN_SET';

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
    ) {}

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
                    case 401:
                        throw new ServiceError('INVALID_CREDENTIALS');
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

    public async logout(): Promise<void> {
        this.tokenSet.next(null);
        await this.userService.clearUser();
        await this.storage.delete(TOKEN_SET_KEY).toPromise();
        await this.router.navigate(['login']);
    }

    public isLoggedInSync(): boolean {
        return !!this.tokenSet.value;
    }

    private async loadTokenSet(): Promise<TokenSet> {
        if (!(await this.storage.has(TOKEN_SET_KEY).toPromise())) return null;
        const tokenSetData: StoredTokenSet = await this.storage
            .get<StoredTokenSet>(TOKEN_SET_KEY, TokenSetSchema)
            .toPromise();
        const tokenSet: TokenSet = {
            accessToken: tokenSetData.accessToken,
            accessTokenExpiry: new Date(tokenSetData.accessTokenExpiry),
            refreshToken: tokenSetData.refreshToken,
            refreshTokenExpiry: new Date(tokenSetData.refreshTokenExpiry),
        };
        this.tokenSet.next(tokenSet);
        return tokenSet;
    }

    private async saveTokenSet(tokenSet: TokenSet): Promise<void> {
        await this.storage
            .set(
                TOKEN_SET_KEY,
                {
                    accessToken: tokenSet.accessToken,
                    refreshToken: tokenSet.refreshToken,
                    refreshTokenExpiry: tokenSet.refreshTokenExpiry.toJSON(),
                    accessTokenExpiry: tokenSet.accessTokenExpiry.toJSON(),
                },
                TokenSetSchema
            )
            .toPromise();
    }

    private getTokenSetFromLoginResponse(resp: AuthLoginResponse) {
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
