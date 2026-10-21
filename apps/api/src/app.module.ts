import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyGuard } from './common/guards/api-key.guard.js';
import databaseConfig from './config/database.config.js';
import { envSchema } from './config/env.validation.js';
import { typeormOptions } from './database/typeorm.options.js';
import { HealthModule } from './health/health.module.js';
import { TotpModule } from './totp/totp.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: envSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => typeormOptions(db.url!, db.ssl),
    }),
    TotpModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class AppModule {}
