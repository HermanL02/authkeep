import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  DATABASE_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  // Comma-separated list so keys can be rotated without downtime.
  API_KEYS: z
    .string()
    .min(1)
    .transform((v) => v.split(',').map((k) => k.trim()).filter(Boolean))
    .pipe(z.array(z.string().min(16, 'Each API key must be at least 16 characters')).min(1)),
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
});

export type Env = z.infer<typeof envSchema>;
