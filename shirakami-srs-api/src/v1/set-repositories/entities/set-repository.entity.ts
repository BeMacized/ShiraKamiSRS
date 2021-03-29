import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SetRepositoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  publicId: string;

  @Column({ nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 2048 })
  indexUrl: string;

  @Column({ type: 'varchar', length: 2048 })
  imageUrl?: string;
}

export type CreateOrUpdateSetRepositoryEntity = Omit<
  SetRepositoryEntity,
  'id' | 'name' | 'imageUrl'
>;
