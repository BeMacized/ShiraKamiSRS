import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RefreshTokenEntity } from '../../authentication/entities/refresh-token.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column()
  discriminator: number;

  @Column()
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
