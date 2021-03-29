import {
  ArrayMinSize,
  ArrayUnique,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ReviewMode } from '../../reviews/dtos/review.dto';
import { Type } from 'class-transformer';
import { SetRepositoryEntity } from '../entities/set-repository.entity';
import {
  SetRepositoryIndexEntity,
  SetRepositoryIndexSetEntity,
} from '../entities/set-repository-index.entity';
import { SUPPORTED_SET_IMPORT_VERSIONS } from '../../v1.constants';

export class SetRepositoryIndexDto {
  @IsUUID()
  publicId: string;
  @IsString()
  @MaxLength(32)
  version: 'v1';
  @IsString()
  @MaxLength(255)
  name: string;
  @IsUrl()
  @IsOptional()
  @MaxLength(2048)
  @ValidateIf((e) => e.imageUrl !== '')
  imageUrl?: string;
  @IsUrl()
  @IsOptional()
  @MaxLength(2048)
  @ValidateIf((e) => e.imageUrl !== '')
  homePageUrl?: string;
  @ValidateNested()
  @Type(() => SetRepositoryIndexSetDto)
  sets: SetRepositoryIndexSetDto[];

  static fromEntity(entity: SetRepositoryIndexEntity): SetRepositoryIndexDto {
    if (!entity) return null;
    return {
      publicId: entity.publicId,
      version: entity.version,
      name: entity.name,
      imageUrl: entity.imageUrl,
      homePageUrl: entity.homePageUrl,
      sets: entity.sets?.map(SetRepositoryIndexSetDto.fromEntity),
    };
  }

  static toEntity(dto: SetRepositoryIndexDto): SetRepositoryIndexEntity {
    if (!dto) return null;
    return {
      publicId: dto.publicId,
      version: dto.version,
      name: dto.name,
      imageUrl: dto.imageUrl,
      homePageUrl: dto.homePageUrl,
      sets: dto.sets?.map(SetRepositoryIndexSetDto.toEntity),
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
  @IsOptional()
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
  @IsBoolean()
  @IsOptional()
  supported?: boolean;

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
      supported: SUPPORTED_SET_IMPORT_VERSIONS.includes(entity.exportVersion),
    };
  }

  static toEntity(dto: SetRepositoryIndexSetDto): SetRepositoryIndexSetEntity {
    if (!dto) return null;
    return {
      name: dto.name,
      exportVersion: dto.exportVersion,
      description: dto.description,
      modes: dto.modes,
      cardCount: dto.cardCount,
      file: dto.file,
    };
  }
}
