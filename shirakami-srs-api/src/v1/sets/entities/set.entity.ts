import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CardEntity } from '../cards/entities/card.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ReviewMode } from '../../reviews/dtos/review.dto';

export class SetSrsStatus {
  lessons: number;
  reviews: number;
  levelItems: { [level: number]: number };
}

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

  @Column('simple-json')
  modes: ReviewMode[];

  @OneToMany(() => CardEntity, (card) => card.set)
  cards?: CardEntity[];

  @CreateDateColumn()
  createdAt: Date;

  srsStatus?: SetSrsStatus;
}
export type CreateOrUpdateSetEntity = Omit<
  SetEntity,
  'id' | 'cards' | 'user' | 'srsStatus' | 'createdAt'
>;
