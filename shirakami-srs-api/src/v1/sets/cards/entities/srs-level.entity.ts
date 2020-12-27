import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { CardEntity } from './card.entity';

@Entity()
export class SrsLevelEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: -1 })
  level: number;

  @Column()
  lastChanged: Date;

  @OneToOne(() => CardEntity, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  card?: CardEntity;

}

