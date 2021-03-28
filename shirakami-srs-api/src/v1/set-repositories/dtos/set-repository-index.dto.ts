import {
  ArrayMinSize,
  ArrayUnique,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ReviewMode } from '../../reviews/dtos/review.dto';
import { Type } from 'class-transformer';
import { SetRepositoryEntity } from '../entities/set-repository.entity';
import {
  SetRepositoryIndexEntity,
  SetRepositoryIndexSetEntity,
} from '../entities/set-repository-index.entity';

export class SetRepositoryIndexDto {
  @IsString()
  @MaxLength(32)
  version: 'v1';
  @IsString()
  @MaxLength(255)
  name: string;
  @IsUrl()
  @IsOptional()
  @MaxLength(2048)
  imageUrl?: string;
  @IsUrl()
  @IsOptional()
  @MaxLength(2048)
  homePageUrl?: string;
  @ValidateNested()
  @Type(() => SetRepositoryIndexSetDto)
  sets: SetRepositoryIndexSetDto[];

  static fromEntity(entity: SetRepositoryIndexEntity): SetRepositoryIndexDto {
    if (!entity) return null;
    return {
      version: entity.version,
      name: entity.name,
      imageUrl: entity.imageUrl,
      homePageUrl: entity.homePageUrl,
      sets: entity.sets?.map(SetRepositoryIndexSetDto.fromEntity),
    };
  }
}

export class SetRepositoryIndexSetDto {
  @IsString()
  @MaxLength(255)
  name: string;
  @IsString()
  @MaxLength(32)
  exportVersion: string;
  @IsString()
  @MaxLength(2048)
  description?: string;
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(['enToJp', 'jpToEn', 'kanjiToKana'], { each: true })
  modes: ReviewMode[];
  @IsNumber()
  cardCount: number;
  @IsString()
  @MaxLength(2048)
  file: string;

  static fromEntity(
    entity: SetRepositoryIndexSetEntity,
  ): SetRepositoryIndexSetDto {
    if (!entity) return null;
    return {
      name: entity.name,
      exportVersion: entity.exportVersion,
      description: entity.description,
      modes: entity.modes,
      cardCount: entity.cardCount,
      file: entity.file,
    };
  }
}
