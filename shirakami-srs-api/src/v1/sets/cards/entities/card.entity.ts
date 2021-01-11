import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SetEntity } from '../../entities/set.entity';

export class CardValue {
  @Column()
  english: string;
  @Column()
  kana: string;
  @Column({ nullable: true })
  kanji?: string;
}

export class SrsLevel {
  @Column({ default: -1 })
  level: number;

  @Column()
  lastChanged: Date;

  static getDefault(): Readonly<SrsLevel> {
    return { level: -1, lastChanged: new Date() };
  }
}

@Entity()
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column(() => CardValue)
  value: CardValue;

  @Column(() => SrsLevel)
  srsLevelEnToJp: SrsLevel;

  @Column(() => SrsLevel)
  srsLevelJpToEn: SrsLevel;

  @Column(() => SrsLevel)
  srsLevelKanjiToKana: SrsLevel;

  @Column()
  setId: string;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  set?: SetEntity;
}

export type CreateOrUpdateCardEntity = Omit<
  CardEntity,
  'id' | 'set' | 'srsLevelEnToJp' | 'srsLevelJpToEn' | 'srsLevelKanjiToKana'
>;
