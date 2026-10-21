import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { Env } from '../../config/env.validation.js';

// AES-256-GCM so secrets are never stored in plaintext in Postgres.
@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(config: ConfigService<Env, true>) {
    this.key = createHash('sha256').update(config.get('ENCRYPTION_KEY', { infer: true })).digest();
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return ['v1', iv, cipher.getAuthTag(), data]
      .map((p) => (typeof p === 'string' ? p : p.toString('base64')))
      .join('.');
  }

  decrypt(payload: string): string {
    const [, iv, tag, data] = payload.split('.').map((s) => Buffer.from(s, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }
}
