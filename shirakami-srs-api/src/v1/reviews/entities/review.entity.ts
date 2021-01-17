import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CardEntity } from '../../sets/cards/entities/card.entity';
import { ReviewMode } from '../dtos/review.dto';

@Entity()
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cardId: string;

  @ManyToOne(() => CardEntity, (card) => card.reviews, { onDelete: 'CASCADE' })
  card?: CardEntity;

  @Column('varchar', { length: 12 })
  mode: ReviewMode;

  @Column()
  creationDate: Date;

  @Column()
  reviewDate: Date;

  @Column()
  currentLevel: number;
}
