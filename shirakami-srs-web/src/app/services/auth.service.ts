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
import { User } from '../models/user.model';
import jwt_decode from 'jwt-decode';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../models/service-error.model';

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
        private authRepository: AuthRepositoryService
    ) {}

    public async init() {
        await this.loadTokenSet();
    }

    public async login(email: string, password: string) {
        if (this.isLoggedInSync()) await this.logout();
        try {
            const resp = await this.authRepository
                .login(email, password)
                .toPromise();
            const tokenSet = this.getTokenSetFromLoginResponse(resp);
            this.tokenSet.next(tokenSet);
            await this.saveTokenSet(tokenSet);
        } catch (e) {
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
    }

    public async logout(): Promise<void> {
        this.tokenSet.next(null);
    }

    public isLoggedInSync(): boolean {
        return !!this.tokenSet.value;
    }

    private async loadTokenSet(): Promise<void> {
        if (!(await this.storage.has(TOKEN_SET_KEY).toPromise())) return;
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
        return;
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
