import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { CardEntity } from '../cards/entities/card.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity()
export class SetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  user?: UserEntity;

  @Column()
  name: string;

  @OneToMany(() => CardEntity, (card) => card.set)
  cards?: CardEntity[];
}
export type CreateSetEntity = Omit<SetEntity, 'id' | 'cards' | 'user'>;
export type UpdateSetEntity = Omit<SetEntity, 'cards' | 'user'>;
