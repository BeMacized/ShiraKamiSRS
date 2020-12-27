import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  card?: CardEntity;

  static getDefaultEntity(): Readonly<Omit<SrsLevelEntity, 'id'>> {
    return { level: -1, lastChanged: new Date() };
  }
}
