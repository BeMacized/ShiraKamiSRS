import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsEnum, IsOptional,
  Length,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ReviewMode } from '../../../reviews/dtos/review.dto';

@ValidatorConstraint({ name: 'translation', async: false })
export class TranslationValidity implements ValidatorConstraintInterface {
  readonly maxOptionals = 3;

  validate(input: string | string[], args: ValidationArguments) {
    if (typeof input !== 'string' && !Array.isArray(input)) return false;
    const translations: string[] = typeof input === 'string' ? [input] : input;
    for (const translation of translations) {
      if (typeof translation !== 'string') return false;
      try {
        this.validateParentheses(translation);
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return (
      args.property +
      ': one or more translations did not meet the standard requirements.'
    );
  }

  validateParentheses(value: string) {
    let optionals = 0;
    let inOptional = false;
    for (let i = 0; i < value.length; i++) {
      switch (value.charAt(i)) {
        case '(':
        case '（':
          if (inOptional) throw { code: 'NESTED_OPTIONALS' };
          inOptional = true;
          break;
        case ')':
        case '）':
          if (!inOptional) throw { code: 'NON_MATCHING_PARENTHESES' };
          optionals++;
          if (optionals > this.maxOptionals)
            throw { code: 'MAX_OPTIONALS_EXCEEDED' };
          inOptional = false;
          break;
      }
    }
    if (inOptional) throw { code: 'NON_MATCHING_PARENTHESES' };
  }
}

export class CreateOrUpdateCardValueDto {
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

export class CardValueDto extends CreateOrUpdateCardValueDto {
  @ArrayUnique()
  @IsEnum(['enToJp', 'jpToEn', 'kanjiToKana'], { each: true })
  supportedModes: ReviewMode[];
}
