import { IsString, Length } from 'class-validator';

export class SubmitPasswordResetRequestDto {
  @IsString()
  token: string;
  @Length(6, 32)
  password: string;
}
