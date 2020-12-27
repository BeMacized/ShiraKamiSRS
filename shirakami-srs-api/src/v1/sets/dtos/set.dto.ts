import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { SetEntity } from '../entities/set.entity';
import { CardDto } from '../cards/dtos/card.dto';

export class CreateSetDto {
  @IsNotEmpty()
  @IsString()
  public readonly name: string;
}

export class UpdateSetDto {
  @IsNotEmpty()
  @IsUUID()
  public readonly id: string;
  @IsNotEmpty()
  @IsString()
  public readonly name: string;
}

export class SetDto extends UpdateSetDto {
  public readonly cards?: CardDto[];

  static fromEntity(entity: SetEntity): SetDto {
    return {
      id: entity.id,
      name: entity.name,
      cards: entity.cards ? entity.cards.map(CardDto.fromEntity) : undefined,
    };
  }
}
