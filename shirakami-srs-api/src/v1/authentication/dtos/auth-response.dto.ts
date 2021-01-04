import { UserEntity } from '../../users/entities/user.entity';

export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
}
