import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RefreshTokenEntity } from '../../authentication/entities/refresh-token.entity';
import { SrsSettings } from '../models/srs-settings';

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

  // Currently standard for all users.
  // Could be made customizable later on.
  srsSettings: SrsSettings = SrsSettings.defaults;
}

export type CreateUserEntity = Omit<
  UserEntity,
  'id' | 'discriminator' | 'passwordHash' | 'srsSettings'
> & {
  password: string;
};
