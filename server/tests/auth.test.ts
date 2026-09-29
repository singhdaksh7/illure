import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { AdminRole } from '@prisma/client';

describe('Admin Authentication & Session Lifecycle', () => {
  const testEmail = 'testadmin@illurefragrance.com';
  const testPassword = 'TestPassword@2026!';
  const inactiveEmail = 'inactiveadmin@illurefragrance.com';

  beforeAll(async () => {
    const passwordHash = await hashPassword(testPassword);

    // Clean up previous test users if any
    await prisma.adminUser.deleteMany({
      where: { email: { in: [testEmail, inactiveEmail] } },
    });

    // Create Active Test Admin User
    await prisma.adminUser.create({
      data: {
        email: testEmail,
        passwordHash,
        name: 'Active Test Admin',
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });

    // Create Inactive Test Admin User
    await prisma.adminUser.create({
      data: {
        email: inactiveEmail,
        passwordHash,
        name: 'Inactive Test Admin',
        role: AdminRole.ADMIN,
        isActive: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.adminUser.deleteMany({
      where: { email: { in: [testEmail, inactiveEmail] } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/admin/auth/login', () => {
    it('should fail with validation error when email or password is missing', async () => {
      const res = await request(app).post('/api/admin/auth/login').send({ email: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with 401 for nonexistent user', async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: 'nonexistent@illure.com', password: 'SomePassword123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail with 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: testEmail, password: 'WrongPassword123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail with 403 for inactive user account', async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: inactiveEmail, password: testPassword });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_DISABLED');
    });

    it('should succeed with valid credentials and return access token & set refresh cookie', async () => {
      const res = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.admin.email).toBe(testEmail);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('admin_refresh_token'))).toBe(true);
    });
  });

  describe('POST /api/admin/auth/refresh & Rotation', () => {
    it('should fail with 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/admin/auth/refresh')
        .set('Cookie', ['admin_refresh_token=invalid_token_string']);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should successfully refresh session and rotate refresh token', async () => {
      // 1. Login to get cookie
      const loginRes = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: testEmail, password: testPassword });

      const cookies1 = loginRes.headers['set-cookie'];
      const refreshToken1 = cookies1
        .find((c: string) => c.startsWith('admin_refresh_token='))
        ?.split(';')[0];

      // 2. Perform refresh using first cookie
      const refreshRes1 = await request(app)
        .post('/api/admin/auth/refresh')
        .set('Cookie', [refreshToken1!]);

      expect(refreshRes1.status).toBe(200);
      expect(refreshRes1.body.success).toBe(true);
      expect(refreshRes1.body.data.accessToken).toBeDefined();

      const cookies2 = refreshRes1.headers['set-cookie'];
      const refreshToken2 = cookies2
        .find((c: string) => c.startsWith('admin_refresh_token='))
        ?.split(';')[0];

      expect(refreshToken2).not.toBe(refreshToken1);

      // 3. Attempt to reuse old revoked token (should fail and trigger security invalidation)
      const reuseRes = await request(app)
        .post('/api/admin/auth/refresh')
        .set('Cookie', [refreshToken1!]);

      expect(reuseRes.status).toBe(401);
      expect(reuseRes.body.success).toBe(false);
      expect(reuseRes.body.error.code).toBe('TOKEN_REUSE_DETECTED');
    });
  });

  describe('GET /api/admin/auth/me & Logout', () => {
    it('should return current admin profile on /me with valid access token', async () => {
      const loginRes = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: testEmail, password: testPassword });

      const token = loginRes.body.data.accessToken;

      const meRes = await request(app)
        .get('/api/admin/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.admin.email).toBe(testEmail);
    });

    it('should revoke session on logout', async () => {
      const loginRes = await request(app)
        .post('/api/admin/auth/login')
        .send({ email: testEmail, password: testPassword });

      const cookies = loginRes.headers['set-cookie'];

      const logoutRes = await request(app)
        .post('/api/admin/auth/logout')
        .set('Cookie', cookies);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Refresh attempt after logout should fail
      const refreshRes = await request(app)
        .post('/api/admin/auth/refresh')
        .set('Cookie', cookies);

      expect(refreshRes.status).toBe(401);
    });
  });
});
