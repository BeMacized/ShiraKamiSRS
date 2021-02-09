import { ReviewMode } from '../models/review.model';
import { CardEntity } from '../models/card.model';
import { EnToJpAnswerMatcher } from './answer-matchers/en-to-jp-answer-matcher';
import { KanjiToKanaAnswerMatcher } from './answer-matchers/kanji-to-kana-answer-matcher';
import { JpToEnAnswerMatcher } from './answer-matchers/jp-to-en-answer-matcher';
import {
    AnswerMatcher,
    AnswerMatcherResult,
} from './answer-matchers/base-answer-matcher';

const matchers: { [mode in ReviewMode]?: AnswerMatcher } = {
    enToJp: new EnToJpAnswerMatcher(),
    jpToEn: new JpToEnAnswerMatcher(),
    kanjiToKana: new KanjiToKanaAnswerMatcher(),
};

export function matchAnswer(
    input: string,
    reviewMode: ReviewMode,
    card: CardEntity
): AnswerMatcherResult {
    return matchers[reviewMode].matchAnswer(input, card.value);
}
