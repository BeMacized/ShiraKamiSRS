import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SetEntity } from '../../entities/set.entity';
import { ReviewEntity } from '../../../reviews/entities/review.entity';

export class CardValue {
  @Column()
  english: string;
  @Column()
  kana: string;
  @Column({ nullable: true })
  kanji?: string;
}

@Entity()
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column(() => CardValue)
  value: CardValue;

  @Column()
  setId: string;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  set?: SetEntity;

  @OneToMany(() => ReviewEntity, (review) => review.card, { eager: true })
  reviews?: ReviewEntity[];
}

export type CreateOrUpdateCardEntity = Omit<
  CardEntity,
  'id' | 'set' | 'reviews'
>;
