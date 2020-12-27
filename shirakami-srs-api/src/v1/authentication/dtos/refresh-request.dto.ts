import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshRequestDto {
  @IsJWT()
  refreshToken: string;
  @IsJWT()
  accessToken: string;
}
