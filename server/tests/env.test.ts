import { describe, it, expect } from 'vitest';
import { validateEnv } from '../src/config/env.js';

describe('Environment Configuration Validation', () => {
  it('should successfully validate environment when all required variables are present', () => {
    const config = validateEnv();
    expect(config.NODE_ENV).toBeDefined();
    expect(config.PORT).toBeTypeOf('number');
    expect(config.DATABASE_URL).toContain('postgresql://');
    expect(config.JWT_ACCESS_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(config.JWT_REFRESH_SECRET.length).toBeGreaterThanOrEqual(32);
  });
});
