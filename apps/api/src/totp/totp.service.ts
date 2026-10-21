import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../common/crypto/encryption.service.js';
import { CreateTotpAccountDto } from './dto/create-totp-account.dto.js';
import { TotpAccount } from './entities/totp-account.entity.js';
import { base32Decode, generateTotp, normalizeBase32, parseOtpauthUri, type TotpAlgorithm } from './lib/totp.js';

const ALGORITHMS: TotpAlgorithm[] = ['SHA1', 'SHA256', 'SHA512'];

@Injectable()
export class TotpService {
  constructor(
    @InjectRepository(TotpAccount)
    private readonly accounts: Repository<TotpAccount>,
    private readonly encryption: EncryptionService,
  ) {}

  async create(dto: CreateTotpAccountDto) {
    let parsed;
    try {
      const fromUri = dto.uri ? parseOtpauthUri(dto.uri) : undefined;
      parsed = {
        label: dto.label ?? fromUri?.label ?? '',
        issuer: dto.issuer ?? fromUri?.issuer ?? null,
        secret: normalizeBase32(dto.secret ?? fromUri?.secret ?? ''),
        digits: dto.digits ?? fromUri?.digits ?? 6,
        period: dto.period ?? fromUri?.period ?? 30,
        algorithm: dto.algorithm ?? fromUri?.algorithm ?? 'SHA1',
      };
      if (!parsed.label) throw new Error('label is required');
      if (base32Decode(parsed.secret).length < 10) throw new Error('secret is too short (min 80 bits)');
      if (![6, 7, 8].includes(parsed.digits)) throw new Error('digits must be 6, 7 or 8');
      if (!(parsed.period >= 10 && parsed.period <= 300)) throw new Error('period must be 10-300 seconds');
      if (!ALGORITHMS.includes(parsed.algorithm)) throw new Error('unsupported algorithm');
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }

    const { secret, ...rest } = parsed;
    const saved = await this.accounts.save(
      this.accounts.create({ ...rest, secretEnc: this.encryption.encrypt(secret) }),
    );
    const { secretEnc: _omit, ...account } = saved;
    return account;
  }

  findAll() {
    return this.accounts.find({ order: { createdAt: 'ASC' } });
  }

  async remove(id: string) {
    const res = await this.accounts.delete(id);
    if (!res.affected) throw new NotFoundException(`TOTP account ${id} not found`);
  }

  async codes() {
    const now = Date.now();
    const rows = await this.withSecrets().orderBy('a.created_at', 'ASC').getMany();
    return rows.map((a) => this.toCode(a, now));
  }

  async code(id: string) {
    const a = await this.withSecrets().where('a.id = :id', { id }).getOne();
    if (!a) throw new NotFoundException(`TOTP account ${id} not found`);
    return this.toCode(a, Date.now());
  }

  private withSecrets() {
    return this.accounts.createQueryBuilder('a').addSelect('a.secretEnc');
  }

  private toCode(a: TotpAccount, now: number) {
    const totp = generateTotp(
      { secret: this.encryption.decrypt(a.secretEnc), digits: a.digits, period: a.period, algorithm: a.algorithm },
      now,
    );
    return { id: a.id, label: a.label, issuer: a.issuer, ...totp };
  }
}
