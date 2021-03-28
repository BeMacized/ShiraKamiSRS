import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1616934220457 implements MigrationInterface {
  name = 'init1616934220457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `user_entity` (`id` varchar(36) NOT NULL, `email` varchar(255) NOT NULL, `username` varchar(32) NOT NULL, `discriminator` int NOT NULL, `passwordHash` varchar(60) NOT NULL, `emailVerified` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX `IDX_415c35b9b3b6fe45a3b065030f` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `refresh_token_entity` (`id` varchar(36) NOT NULL, `userId` varchar(255) NOT NULL, `token` text NOT NULL, `revoked` tinyint NOT NULL DEFAULT 0, `expiration` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `set_entity` (`id` varchar(36) NOT NULL, `userId` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `modes` text NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `card_entity` (`id` varchar(36) NOT NULL, `sortIndex` int NOT NULL, `setId` varchar(255) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `valueEntranslations` text NOT NULL, `valueJptranslations` text NOT NULL, `valueEnnote` varchar(255) NULL, `valueJpnote` varchar(255) NULL, `valueSupportedmodes` text NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `review_entity` (`id` varchar(36) NOT NULL, `cardId` varchar(255) NOT NULL, `mode` varchar(12) NOT NULL, `creationDate` datetime NOT NULL, `reviewDate` datetime NOT NULL, `currentLevel` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `refresh_token_entity` ADD CONSTRAINT `FK_ebf65cd067163c7c66baa3da1c1` FOREIGN KEY (`userId`) REFERENCES `user_entity`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `set_entity` ADD CONSTRAINT `FK_eef63bc9a48cc7c315d3c998c78` FOREIGN KEY (`userId`) REFERENCES `user_entity`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `card_entity` ADD CONSTRAINT `FK_8594369a7e9f0960b1ce8e4bb0d` FOREIGN KEY (`setId`) REFERENCES `set_entity`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `review_entity` ADD CONSTRAINT `FK_5992f19c17c17c4135723cc3d90` FOREIGN KEY (`cardId`) REFERENCES `card_entity`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `review_entity` DROP FOREIGN KEY `FK_5992f19c17c17c4135723cc3d90`',
    );
    await queryRunner.query(
      'ALTER TABLE `card_entity` DROP FOREIGN KEY `FK_8594369a7e9f0960b1ce8e4bb0d`',
    );
    await queryRunner.query(
      'ALTER TABLE `set_entity` DROP FOREIGN KEY `FK_eef63bc9a48cc7c315d3c998c78`',
    );
    await queryRunner.query(
      'ALTER TABLE `refresh_token_entity` DROP FOREIGN KEY `FK_ebf65cd067163c7c66baa3da1c1`',
    );
    await queryRunner.query('DROP TABLE `review_entity`');
    await queryRunner.query('DROP TABLE `card_entity`');
    await queryRunner.query('DROP TABLE `set_entity`');
    await queryRunner.query('DROP TABLE `refresh_token_entity`');
    await queryRunner.query(
      'DROP INDEX `IDX_415c35b9b3b6fe45a3b065030f` ON `user_entity`',
    );
    await queryRunner.query('DROP TABLE `user_entity`');
  }
}
