import { CardValueEntity } from '../../models/card-value.model';
import { flatten } from 'lodash';

export type AnswerMatcherResult = { givenAnswer: string } & (
    | { passing: true; correctAnswer: string }
    | { passing: false }
);

export abstract class AnswerMatcher {
    abstract matchAnswer(
        input: string,
        cardValue: CardValueEntity
    ): AnswerMatcherResult;

    parseAnswers(
        answerStrings: string[]
    ): Array<{ answer: string; subAnswers: string[] }> {
        return (
            answerStrings
                // Sanitize answers
                .map((answer) => ({
                    answer,
                    sanitized: this.sanitizeAnswer(answer),
                }))
                // Generate all possible answers from optionals
                .map((answerObj) => {
                    const optionalMatches = [
                        ...answerObj.sanitized.matchAll(/[(]([^()]*)[)]/g),
                    ];
                    const subAnswers = !optionalMatches.length
                        ? [answerObj.sanitized]
                        : [
                              ...Array(
                                  Math.pow(2, optionalMatches.length)
                              ).keys(),
                          ].map((_, index) => {
                              let str = `${answerObj.sanitized}`;
                              optionalMatches.forEach((match, matchIndex) => {
                                  str =
                                      str.substring(0, str.indexOf('(')) +
                                      // tslint:disable-next-line:no-bitwise
                                      (index & (1 << matchIndex)
                                          ? match[1]
                                          : '') +
                                      str.substring(
                                          str.indexOf(')') + 1,
                                          str.length
                                      );
                              });
                              return str;
                          });
                    return {
                        answer: answerObj.answer,
                        subAnswers,
                    };
                })
        );
    }

    sanitizeAnswer(answer: string): string {
        return answer
            .replace(/[（]/g, '(')
            .replace(/[）]/g, ')')
            .replace(/\s+/g, '')
            .toLowerCase();
    }
}
