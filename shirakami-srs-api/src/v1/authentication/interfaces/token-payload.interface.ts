export interface AccessTokenPayload {
  type: 'ACCESS';
  userId: string;
}

export interface RefreshTokenPayload {
  type: 'REFRESH';
  userId: string;
  jwtId: string;
}

export interface EmailVerificationTokenPayload {
  type: 'EMAIL_VERIFICATION';
  userId: string;
  email: string;
}

export interface PasswordResetTokenPayload {
  type: 'PASSWORD_RESET';
  userId: string;
}
