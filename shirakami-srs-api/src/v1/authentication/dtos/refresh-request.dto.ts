import { IsNotEmpty } from 'class-validator';

export class RefreshRequestDTO {
  @IsNotEmpty()
  refreshToken: string;
  @IsNotEmpty()
  accessToken: string;
}
