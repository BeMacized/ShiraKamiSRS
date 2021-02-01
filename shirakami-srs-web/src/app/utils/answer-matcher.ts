import { ReviewMode } from '../models/review.model';
import { CardEntity } from '../models/card.model';
import * as wanakana from 'wanakana';
import { distance } from 'damerau-levenshtein-js';

const sanitizeEnglish = (str: string): string =>
    str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^a-z0-9 ]/, '');

const sanitizeJapanese = (str: string): string =>
    wanakana
        .toHiragana(
            wanakana.toHiragana(str.trim().toLowerCase().replace(/\s+/g, ''))
        )
        .replace(/[^ぁ-ん一-龯ー々0-9０-９]/g, '');

const matchEnglish = (input: string, answer: string): boolean => {
    input = sanitizeEnglish(input);

    return !!answer
        .split(';')
        .map((a) => sanitizeEnglish(a))
        .filter((a) => !!a)
        .find((a) => {
            const allowedDistance = ((length: number): number => {
                if (length <= 3) return 0;
                if (length <= 5) return 1;
                if (length <= 7) return 2;
                return Math.round(2 + length / 7);
            })(a.length);
            return distance(input, a) <= allowedDistance;
        });
};

const matchJapanese = (
    input: string,
    kanaAnswer: string,
    kanjiAnswer: string
): boolean => {
    console.log('MATCH JAPANESE', {
        input: input + '',
        sanitizedInput: sanitizeJapanese(input),
        answer: kanaAnswer,
        sanitizedAnswer: sanitizeJapanese(kanaAnswer),
    });
    input = sanitizeJapanese(input);

    return !!kanaAnswer
        .split(';')
        .concat(kanjiAnswer.split(';'))
        .map((a) => sanitizeJapanese(a))
        .filter((a) => !!a)
        .find((a) => input === a);
};

export const matchAnswer = (
    input: string,
    mode: ReviewMode,
    card: CardEntity
): boolean => {
    switch (mode) {
        case 'enToJp':
            return matchJapanese(
                input,
                card.value.kana,
                card.value.kanji || ''
            );
        case 'jpToEn':
            return matchEnglish(input, card.value.english);
        case 'kanjiToKana':
            return matchJapanese(input, card.value.kana, '');
        default:
            return false;
    }
};
