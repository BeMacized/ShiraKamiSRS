import { UserEntity } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  discriminator: number;

  static fromEntity(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      discriminator: user.discriminator,
    };
  }
}
