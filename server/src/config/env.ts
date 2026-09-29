import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),
  COOKIE_DOMAIN: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),

  SEED_ADMIN_EMAIL: z.string().email().default('admin@illurefragrance.com'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('SuperAdmin@Illure2026!'),
  SEED_ADMIN_NAME: z.string().default('Illure Admin'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid Environment Configuration:');
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Environment configuration validation failed.');
  }
  return result.data;
}

export const env = validateEnv();
