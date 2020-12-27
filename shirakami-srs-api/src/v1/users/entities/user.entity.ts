import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RefreshTokenEntity } from '../../authentication/entities/refresh-token.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 32 })
  username: string;

  @Column()
  discriminator: number;

  @Column({ type: 'varchar', length: 60 })
  passwordHash?: string;

  @OneToMany(() => RefreshTokenEntity, (entity) => entity.user)
  refreshTokens?: RefreshTokenEntity[];
}

export type CreateUserEntity = Omit<
  UserEntity,
  'id' | 'discriminator' | 'passwordHash'
> & {
  password: string;
};
