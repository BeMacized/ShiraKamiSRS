import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterRequestDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  password: string;
}
