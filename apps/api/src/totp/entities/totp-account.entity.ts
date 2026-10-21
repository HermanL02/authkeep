import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { TotpAlgorithm } from '../lib/totp.js';

@Entity('totp_accounts')
export class TotpAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuer: string | null;

  @Column({ name: 'secret_enc', type: 'text', select: false })
  secretEnc: string;

  @Column({ type: 'smallint', default: 6 })
  digits: number;

  @Column({ type: 'smallint', default: 30 })
  period: number;

  @Column({ type: 'varchar', length: 10, default: 'SHA1' })
  algorithm: TotpAlgorithm;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
