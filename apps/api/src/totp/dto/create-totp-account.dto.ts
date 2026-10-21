import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import type { TotpAlgorithm } from '../lib/totp.js';

export class CreateTotpAccountDto {
  @ApiPropertyOptional({
    description: 'Full otpauth:// URI from the QR code. When set, the other fields are optional overrides.',
    example: 'otpauth://totp/GitHub:me%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub',
  })
  @IsOptional()
  @IsString()
  @Matches(/^otpauth:\/\/totp\//i, { message: 'uri must start with otpauth://totp/' })
  uri?: string;

  @ApiPropertyOptional({ description: 'Required when uri is not given', example: 'me@example.com' })
  @ValidateIf((o: CreateTotpAccountDto) => !o.uri || o.label !== undefined)
  @IsString()
  @MaxLength(255)
  label?: string;

  @ApiPropertyOptional({ description: 'Base32 secret. Required when uri is not given', example: 'JBSWY3DPEHPK3PXP' })
  @ValidateIf((o: CreateTotpAccountDto) => !o.uri)
  @IsString()
  secret?: string;

  @ApiPropertyOptional({ example: 'GitHub' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  issuer?: string;

  @ApiPropertyOptional({ enum: [6, 7, 8], default: 6 })
  @IsOptional()
  @IsIn([6, 7, 8])
  digits?: number;

  @ApiPropertyOptional({ default: 30, minimum: 10, maximum: 300 })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(300)
  period?: number;

  @ApiPropertyOptional({ enum: ['SHA1', 'SHA256', 'SHA512'], default: 'SHA1' })
  @IsOptional()
  @IsIn(['SHA1', 'SHA256', 'SHA512'])
  algorithm?: TotpAlgorithm;
}
