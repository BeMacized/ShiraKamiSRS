import { IsOptional, IsString, Length } from 'class-validator';

export class CardValueDto {
  @IsString()
  @Length(1, 255)
  public readonly english: string;
  @IsString()
  @Length(1, 255)
  public readonly kana: string;
  @IsString()
  @IsOptional()
  @Length(1, 255)
  public readonly kanji?: string;
}
