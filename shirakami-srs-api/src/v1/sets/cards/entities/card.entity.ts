import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { SetEntity } from '../../entities/set.entity';
import { IsString } from 'class-validator';

class CardValue {
  english: string;
  kanaOnly: string;
  withKanji?: string;
}

@Entity()
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-json')
  value: CardValue;

  @Column({ default: 0 })
  srsLevel: number;

  @Column()
  levelLastChanged: Date;

  @Column()
  setId: string;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  set?: SetEntity;
}

export type CreateCardEntity = Omit<CardEntity, 'id' | 'set'>;
export type UpdateCardEntity = Omit<CardEntity, 'set'>;
