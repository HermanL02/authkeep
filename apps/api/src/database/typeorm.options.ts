import type { DataSourceOptions } from 'typeorm';
import { TotpAccount } from '../totp/entities/totp-account.entity.js';
import { CreateTotpAccounts1761069600000 } from './migrations/1761069600000-create-totp-accounts.js';

// Shared by the Nest app and the TypeORM CLI data source.
export function typeormOptions(url: string, ssl: boolean): DataSourceOptions {
  return {
    type: 'postgres',
    url,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    entities: [TotpAccount],
    migrations: [CreateTotpAccounts1761069600000],
    // Never auto-sync the schema in production; migrations run on boot instead.
    synchronize: false,
    migrationsRun: true,
  };
}
