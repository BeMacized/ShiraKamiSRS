import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CardValueDTO {
  @IsString()
  @IsNotEmpty()
  public readonly english: string;
  @IsString()
  @IsNotEmpty()
  public readonly kanaOnly: string;
  @IsString()
  @IsOptional()
  public readonly withKanji?: string;
}
