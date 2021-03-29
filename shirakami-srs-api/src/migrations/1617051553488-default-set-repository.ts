import { MigrationInterface, QueryRunner } from 'typeorm';

export class defaultSetRepository1617051553488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "INSERT INTO `set_repository_entity` (id, publicId, userId, name, indexUrl, imageUrl) VALUES ('7b8c65c8-91ba-4e3a-ab34-88a2b65deb60', 'dcf1b045-55e5-4471-affc-4815f2249a7c', null, 'ShiraKamiSRS Public', 'https://bemacized.github.io/ShiraKamiSRS-Public/repository/index.json', '');",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DELETE FROM `set_repository_entity` WHERE id = '7b8c65c8-91ba-4e3a-ab34-88a2b65deb60'",
    );
  }
}
