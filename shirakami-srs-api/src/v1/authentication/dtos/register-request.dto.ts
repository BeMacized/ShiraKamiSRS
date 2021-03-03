import { IsEmail, Length, Matches } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  email: string;
  @Length(3, 32)
  @Matches(/^[a-zA-Z0-9-_]+$/)
  username: string;
  @Length(6, 32)
  password: string;
}
