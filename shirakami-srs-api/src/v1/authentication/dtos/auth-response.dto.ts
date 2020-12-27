import { UserEntity } from '../../users/entities/user.entity';

export class AuthResponseDto {
  user: UserEntity;
  accessToken: string;
  refreshToken?: string;
}
