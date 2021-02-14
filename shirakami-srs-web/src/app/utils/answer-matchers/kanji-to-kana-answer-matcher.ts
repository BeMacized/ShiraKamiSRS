import { CardValueEntity } from '../../models/card-value.model';
import { AnswerMatcher, AnswerMatcherResult } from './base-answer-matcher';
import * as wanakana from 'wanakana';

export class KanjiToKanaAnswerMatcher extends AnswerMatcher {
    matchAnswer(
        input: string,
        cardValue: CardValueEntity
    ): AnswerMatcherResult {
        // Sanitize input
        const sanitizedAnswer = this.sanitizeJapanese(input);
        // Parse answers
        const parsedAnswers = this.parseAnswers(
            cardValue.jpTranslations.map((t) => t[0])
        )
            // Sanitize all answers for comparison
            .map((answerObj) => {
                answerObj.subAnswers = answerObj.subAnswers.map(
                    this.sanitizeJapanese
                );
                return answerObj;
            });
        const matchingAnswer = parsedAnswers.find((answer) =>
            answer.subAnswers.includes(sanitizedAnswer)
        );
        if (matchingAnswer) {
            return {
                passing: true,
                givenAnswer: input,
                correctAnswer: matchingAnswer.answer,
            };
        } else {
            return {
                passing: false,
                givenAnswer: input,
            };
        }
    }

    sanitizeJapanese(value: string): string {
        return wanakana
            .toHiragana(wanakana.toKatakana(wanakana.toHiragana(value)))
            .replace(/[^ぁ-んァ-ン０-９0-9ー]/g, '');
    }
}
