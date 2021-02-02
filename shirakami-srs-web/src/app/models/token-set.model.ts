import { JSONSchema } from '@ngx-pwa/local-storage';

export interface TokenSet {
    accessToken: string;
    accessTokenExpiry: Date;
    refreshToken: string;
    refreshTokenExpiry: Date;
}

export interface StoredTokenSet {
    accessToken: string;
    accessTokenExpiry: number;
    refreshToken: string;
    refreshTokenExpiry: number;
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
        refreshTokenExpiry: { type: 'number' },
        accessTokenExpiry: { type: 'number' },
    },
};
