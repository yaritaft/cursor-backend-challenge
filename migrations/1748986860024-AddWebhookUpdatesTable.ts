import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWebhookUpdatesTable1748986860024 implements MigrationInterface {
    name = 'AddWebhookUpdatesTable1748986860024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "webhook_updates" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "source" character varying, "payload" jsonb NOT NULL, "processed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_db6582e62ea9f6b2a0439375edd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "favoriteColor"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "favoriteColor" character varying`);
        await queryRunner.query(`DROP TABLE "webhook_updates"`);
    }

}
