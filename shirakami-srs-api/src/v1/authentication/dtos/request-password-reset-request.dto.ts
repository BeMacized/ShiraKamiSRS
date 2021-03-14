import { IsEmail } from 'class-validator';

export class RequestPasswordResetRequestDto {
  @IsEmail()
  email: string;
}
