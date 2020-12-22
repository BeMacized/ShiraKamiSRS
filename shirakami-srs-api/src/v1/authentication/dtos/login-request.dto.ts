import { IsNotEmpty } from 'class-validator';

export class LoginRequestDTO {
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}
