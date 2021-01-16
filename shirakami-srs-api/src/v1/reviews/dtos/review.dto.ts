export type ReviewMode = 'enToJp' | 'jpToEn' | 'kanjiToKana';
export const ReviewModes: Readonly<ReviewMode[]> = [
  'enToJp',
  'jpToEn',
  'kanjiToKana',
];

export class ReviewDto {
  setId: string;
  cardId: string;
  reviewTime: number;
  mode: ReviewMode;
  srsLevel: number;
}
