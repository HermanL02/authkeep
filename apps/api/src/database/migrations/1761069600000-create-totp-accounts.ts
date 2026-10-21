import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTotpAccounts1761069600000 implements MigrationInterface {
  name = 'CreateTotpAccounts1761069600000';

  async up(q: QueryRunner): Promise<void> {
    // gen_random_uuid() is built into Postgres 13+, no extension needed.
    await q.query(`
      CREATE TABLE "totp_accounts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "label" varchar(255) NOT NULL,
        "issuer" varchar(255),
        "secret_enc" text NOT NULL,
        "digits" smallint NOT NULL DEFAULT 6,
        "period" smallint NOT NULL DEFAULT 30,
        "algorithm" varchar(10) NOT NULL DEFAULT 'SHA1',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE "totp_accounts"`);
  }
}
