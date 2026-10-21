import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptionService } from '../common/crypto/encryption.service.js';
import { TotpAccount } from './entities/totp-account.entity.js';
import { TotpController } from './totp.controller.js';
import { TotpService } from './totp.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TotpAccount])],
  controllers: [TotpController],
  providers: [TotpService, EncryptionService],
})
export class TotpModule {}
