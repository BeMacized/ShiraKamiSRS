import { UserEntity } from '../../users/entities/user.entity';

export class AuthResponseDTO {
  user: UserEntity;
  accessToken: string;
  refreshToken?: string;
}
