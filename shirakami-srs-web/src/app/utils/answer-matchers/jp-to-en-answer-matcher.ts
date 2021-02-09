import { CardValueEntity } from '../../models/card-value.model';
import { flatten, sortBy } from 'lodash';
import { AnswerMatcher, AnswerMatcherResult } from './base-answer-matcher';
// @ts-ignore
import { distance } from 'damerau-levenshtein-js';

export class JpToEnAnswerMatcher extends AnswerMatcher {
    matchAnswer(
        input: string,
        cardValue: CardValueEntity
    ): AnswerMatcherResult {
        // Sanitize input
        const sanitizedAnswer = this.sanitizeEnglish(input);
        // Parse answers
        const parsedAnswers = this.parseAnswers([cardValue.english])
            // Sanitize all answers for comparison
            .map((answerObj) => {
                answerObj.subAnswers = answerObj.subAnswers.map(
                    this.sanitizeEnglish
                );
                return answerObj;
            })
            // Calculate the levenshtein distance per sub answer
            .map((answerObj) => ({
                ...answerObj,
                subAnswers: answerObj.subAnswers.map((subAnswer) => ({
                    subAnswer,
                    distance: distance(subAnswer, sanitizedAnswer),
                })),
            }));
        const allowedDistance = this.allowedDistance(sanitizedAnswer.length);
        const matchingAnswer = sortBy(
            flatten(
                parsedAnswers.map((a) =>
                    a.subAnswers.map((sa) => ({
                        answer: a.answer,
                        distance: sa.distance,
                    }))
                )
            ),
            ['distance']
        ).find((answer) => answer.distance <= allowedDistance);
        console.log({ parsedAnswers, allowedDistance, matchingAnswer });
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

    sanitizeEnglish(value: string): string {
        return (
            value
                // Normalize 'accents'
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                // Remove all non relevant characters
                .replace(/[^a-zA-Z0-9]/g, '')
        );
    }

    allowedDistance(length: number): number {
        if (length <= 3) return 0;
        if (length <= 5) return 1;
        if (length <= 7) return 2;
        return Math.round(2 + length / 7);
    }
}
