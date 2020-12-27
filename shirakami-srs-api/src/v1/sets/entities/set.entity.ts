import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
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

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => CardEntity, (card) => card.set)
  cards?: CardEntity[];
}
export type CreateOrUpdateSetEntity = Omit<SetEntity, 'id' | 'cards' | 'user'>;
