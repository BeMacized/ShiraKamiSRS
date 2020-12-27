import { IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';
import { SetEntity } from '../entities/set.entity';
import { CardDto } from '../cards/dtos/card.dto';

export class CreateOrUpdateSetDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 255)
  public readonly name: string;
}

export class SetDto extends CreateOrUpdateSetDto {
  @IsNotEmpty()
  @IsUUID()
  public readonly id: string;

  public readonly cards?: CardDto[];

  static fromEntity(entity: SetEntity): SetDto {
    return {
      id: entity.id,
      name: entity.name,
      cards: entity.cards ? entity.cards.map(CardDto.fromEntity) : undefined,
    };
  }
}
