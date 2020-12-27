import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CardValueDto {
  @IsString()
  @IsNotEmpty()
  public readonly english: string;
  @IsString()
  @IsNotEmpty()
  public readonly kana: string;
  @IsString()
  @IsOptional()
  public readonly kanji?: string;
}
