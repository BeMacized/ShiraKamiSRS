export interface AuthResponseDto {
    accessToken: string;
    refreshToken: string;
}

export interface RegisterResponseDto {
    success: boolean;
    needsAccountVerification: boolean;
}
