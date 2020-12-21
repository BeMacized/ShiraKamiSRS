import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CardEntity } from '../cards/entities/card.entity';

@Entity()
export class SetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => CardEntity, (card) => card.set)
  cards?: CardEntity[];
}
export type CreateSetEntity = Omit<SetEntity, 'id'>;
