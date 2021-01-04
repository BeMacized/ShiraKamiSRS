import { JSONSchema } from '@ngx-pwa/local-storage';

export interface TokenSet {
    accessToken: string;
    accessTokenExpiry: Date;
    refreshToken: string;
    refreshTokenExpiry: Date;
}

export interface StoredTokenSet {
    accessToken: string;
    accessTokenExpiry: string;
    refreshToken: string;
    refreshTokenExpiry: string;
}

export const TokenSetSchema: JSONSchema = {
    type: 'object',
    required: [
        'accessToken',
        'refreshToken',
        'refreshTokenExpiry',
        'accessTokenExpiry',
    ],
    properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        refreshTokenExpiry: { type: 'string' },
        accessTokenExpiry: { type: 'string' },
    },
};
