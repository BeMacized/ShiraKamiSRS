import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SetEntity } from '../../entities/set.entity';
import { ReviewEntity } from '../../../reviews/entities/review.entity';
import { ReviewMode } from '../../../reviews/dtos/review.dto';

export class CardValue {
  @Column('simple-json')
  enTranslations: string[];
  @Column('simple-json')
  jpTranslations: [string, string?][];
  @Column({ type: 'varchar', length: 255, nullable: true })
  enNote?: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  jpNote?: string;
  @Column('simple-json')
  supportedModes: ReviewMode[];
}

@Entity()
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sortIndex: number;

  @Column(() => CardValue)
  value: CardValue;

  @Column()
  setId: string;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  set?: SetEntity;

  @OneToMany(() => ReviewEntity, (review) => review.card)
  reviews?: ReviewEntity[];

  @CreateDateColumn()
  createdAt: Date;
}

export type CreateOrUpdateCardEntity = Omit<
  CardEntity,
  'id' | 'set' | 'reviews' | 'createdAt'
>;

export const buildSupportedCardModes = (cardValue: CardValue): ReviewMode[] => {
  const modes: ReviewMode[] = ['enToJp', 'jpToEn'];
  if (cardValue.jpTranslations.find((v) => v.length === 2))
    modes.push('kanjiToKana');
  return modes;
};
