import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity()
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  user?: string;

  @Column({ type: 'text' })
  token: string;

  @Column({ default: false })
  revoked?: boolean;

  @Column()
  expiration: Date;
}
export type CreateRefreshTokenEntity = Omit<RefreshTokenEntity, 'id'>;
