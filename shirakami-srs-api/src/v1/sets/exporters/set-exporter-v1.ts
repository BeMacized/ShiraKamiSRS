import { CreateOrUpdateSetEntity, SetEntity } from '../entities/set.entity';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Validate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TranslationValidity } from '../cards/dtos/card-value.dto';
import {
  buildSupportedCardModes,
  CreateOrUpdateCardEntity,
} from '../cards/entities/card.entity';
import { ReviewMode, ReviewModes } from '../../reviews/dtos/review.dto';
import { flatten } from 'lodash';
import { ReviewEntity } from '../../reviews/entities/review.entity';
import { MAX_CARDS_PER_SET } from '../../v1.constants';

export class SetExportV1 {
  exportVersion: 'v1';
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  name: string;
  @ValidateNested({ each: true })
  @Type(() => SetExportV1Card)
  @ArrayMaxSize(MAX_CARDS_PER_SET)
  cards: SetExportV1Card[];
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(['enToJp', 'jpToEn', 'kanjiToKana'], { each: true })
  modes: ReviewMode[];
  @ValidateNested({ each: true })
  @Type(() => SetExportV1Review)
  @ArrayMaxSize(MAX_CARDS_PER_SET * 3)
  @IsOptional()
  reviews?: SetExportV1Review[];
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

export class SetExportV1Review {
  @IsNumber()
  cardIndex: number;
  @IsEnum(['enToJp', 'jpToEn', 'kanjiToKana'])
  mode: ReviewMode;
  @IsNumber()
  creationDate: number;
  @IsNumber()
  reviewDate: number;
  @IsNumber()
  currentLevel: number;
}

export const exportSetV1 = (
  set: SetEntity,
  includeReviews: boolean,
): SetExportV1 => {
  return {
    exportVersion: 'v1',
    name: set.name,
    cards: set.cards.map((card) => ({
      enTranslations: card.value.enTranslations,
      jpTranslations: card.value.jpTranslations,
      enNote: card.value.enNote,
      jpNote: card.value.jpNote,
    })),
    modes: set.modes.slice(),
    reviews: !includeReviews
      ? undefined
      : flatten(
          set.cards.map((card, cardIndex) =>
            card.reviews.map((review) => ({
              cardIndex,
              mode: review.mode,
              creationDate: Math.round(review.creationDate.getTime() / 1000),
              reviewDate: Math.round(review.reviewDate.getTime() / 1000),
              currentLevel: review.currentLevel,
            })),
          ),
        ),
  };
};

export const importSetV1 = (
  exportData: SetExportV1,
): {
  set: Omit<CreateOrUpdateSetEntity, 'userId' | 'createdAt'>;
  cards: Omit<CreateOrUpdateCardEntity, 'setId' | 'sortIndex'>[];
  reviews?: Array<
    Omit<ReviewEntity, 'id' | 'card' | 'cardId'> & { cardIndex: number }
  >;
} => {
  const set = {
    name: exportData.name,
    modes: exportData.modes ?? ReviewModes.slice(),
  };
  const cards = exportData.cards
    .map((cardData) => ({
      value: {
        enTranslations: cardData.enTranslations,
        jpTranslations: cardData.jpTranslations,
        enNote: cardData.enNote,
        jpNote: cardData.jpNote,
        supportedModes: [],
      },
    }))
    .map(
      (card) => (
        (card.value.supportedModes = buildSupportedCardModes(card.value)), card
      ),
    );
  const reviews = !exportData.reviews
    ? null
    : exportData.reviews.map((review) => ({
        cardIndex: review.cardIndex,
        mode: review.mode,
        creationDate: new Date(review.creationDate * 1000),
        reviewDate: new Date(review.reviewDate * 1000),
        currentLevel: review.currentLevel,
      }));
  return {
    set,
    cards,
    reviews,
  };
};
