import { SetEntity } from '../entities/set.entity';
import { Column } from 'typeorm';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TranslationValidity } from '../cards/dtos/card-value.dto';

export class SetExportV1 {
  exportVersion: 'v1';
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  name: string;
  @ValidateNested({ each: true })
  @Type(() => SetExportV1Card)
  @ArrayMaxSize(10000)
  cards: SetExportV1Card[];
}

export class SetExportV1Card {
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @Length(1, 255, { each: true })
  @Validate(TranslationValidity, { each: true })
  enTranslations: string[];
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ArrayMinSize(1, { each: true })
  @ArrayMaxSize(2, { each: true })
  @Validate(TranslationValidity, { each: true })
  jpTranslations: [string, string?][];
  @Length(0, 255)
  @IsOptional()
  jpNote?: string;
  @Length(0, 255)
  @IsOptional()
  enNote?: string;
}

export const exportSetV1 = (set: SetEntity): SetExportV1 => {
  return {
    exportVersion: 'v1',
    name: set.name,
    cards: set.cards.map((card) => ({
      enTranslations: card.value.enTranslations,
      jpTranslations: card.value.jpTranslations,
      enNote: card.value.enNote,
      jpNote: card.value.jpNote,
    })),
  };
};
