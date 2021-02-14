import {
  Column,
  Entity,
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
