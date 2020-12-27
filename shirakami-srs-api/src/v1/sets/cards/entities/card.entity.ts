import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { SetEntity } from '../../entities/set.entity';
import { IsString } from 'class-validator';
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

  @OneToOne(() => SrsLevelEntity, level => level.card, { cascade: true, eager: true })
  srsLevelEnToJp: SrsLevelEntity;

  @OneToOne(() => SrsLevelEntity, level => level.card, { cascade: true, eager: true })
  srsLevelJpToEn: SrsLevelEntity;

  @OneToOne(() => SrsLevelEntity, level => level.card, { cascade: true, eager: true })
  srsLevelKanjiToKana: SrsLevelEntity;

  @Column()
  setId: string;

  @ManyToOne(() => SetEntity, (set) => set.cards, { onDelete: 'CASCADE' })
  set?: SetEntity;
}

export type UpdateCardEntity = Omit<CardEntity, 'set' | 'srsLevelEnToJp' | 'srsLevelJpToEn' | 'srsLevelKanjiToKana'>;
export type CreateCardEntity = Omit<UpdateCardEntity, 'id'>;
