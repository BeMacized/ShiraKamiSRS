import { MigrationInterface, QueryRunner } from 'typeorm';

export class setRepositories1616933971799 implements MigrationInterface {
  name = 'setRepositories1616933971799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `set_repository_entity` (`id` varchar(36) NOT NULL, `userId` varchar(255) NULL, `name` varchar(255) NOT NULL, `indexUrl` varchar(2048) NOT NULL, `imageUrl` varchar(2048) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `set_repository_entity`');
  }
}