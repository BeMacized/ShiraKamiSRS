import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SetEntity } from '../../entities/set.entity';
import { SrsLevelEntity } from './srs-level.entity';

class CardValue {
  english: string;
  kana: string;
  kanji?: string;
}

@Entity()
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-json')
  value: CardValue;

  @OneToOne(() => SrsLevelEntity, (level) => level.card, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  srsLevelEnToJp: SrsLevelEntity;

  @OneToOne(() => SrsLevelEntity, (level) => level.card, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  srsLevelJpToEn: SrsLevelEntity;

  @OneToOne(() => SrsLevelEntity, (level) => level.card, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  srsLevelKanjiToKana: SrsLevelEntity;

  @Column()
  setId: string;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  set?: SetEntity;
}

export type CreateOrUpdateCardEntity = Omit<
  CardEntity,
  'id' | 'set' | 'srsLevelEnToJp' | 'srsLevelJpToEn' | 'srsLevelKanjiToKana'
>;
