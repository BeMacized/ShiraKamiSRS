import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { SetEntity } from '../entities/set.entity';
import { CardDTO } from '../cards/dtos/card.dto';

export class BaseSetDTO {
  @IsNotEmpty()
  @IsString()
  public readonly name: string;
}

export class SetDTO extends BaseSetDTO {
  @IsNotEmpty()
  @IsUUID()
  public readonly id: string;
  public readonly cards?: CardDTO[];

  static fromEntity(entity: SetEntity): SetDTO {
    return {
      id: entity.id,
      name: entity.name,
      cards: entity.cards ? entity.cards.map(CardDTO.fromEntity) : undefined,
    };
  }
}
