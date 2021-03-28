import { ReviewMode } from '../../reviews/dtos/review.dto';

export class SetRepositoryIndexEntity {
  version: 'v1';
  publicId: string;
  name: string;
  imageUrl?: string;
  homePageUrl?: string;
  sets: SetRepositoryIndexSetEntity[];
}

export class SetRepositoryIndexSetEntity {
  name: string;
  exportVersion: string;
  description?: string;
  modes: ReviewMode[];
  cardCount: number;
  file: string;
}
