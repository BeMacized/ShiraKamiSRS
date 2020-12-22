export interface AccessTokenPayload {
  userId: string;
}

export interface RefreshTokenPayload {
  userId: string;
  jwtId: string;
}
