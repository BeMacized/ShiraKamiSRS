import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SetRepositoryEntity } from '../entities/set-repository.entity';

export class CreateOrUpdateSetRepositoryDto {
  @IsUrl()
  @MaxLength(2048)
  indexUrl: string;
}

export class SetRepositoryDto extends CreateOrUpdateSetRepositoryDto {
  @IsUUID()
  public readonly id: string;
  @IsString()
  @MaxLength(255)
  name: string;
  @IsUrl()
  @MaxLength(2048)
  @IsOptional()
  @ValidateIf((e) => e.imageUrl !== '')
  imageUrl?: string;

  static fromEntity(entity: SetRepositoryEntity): SetRepositoryDto {
    if (!entity) return null;
    return {
      id: entity.id,
      indexUrl: entity.indexUrl,
      name: entity.name,
      imageUrl: entity.imageUrl,
    };
  }
}
