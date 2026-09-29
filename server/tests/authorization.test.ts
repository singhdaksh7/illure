import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { generateAccessToken } from '../src/utils/jwt.utils.js';
import { AdminRole } from '@prisma/client';

describe('Role-Based Authorization Middleware', () => {
  const superAdminEmail = 'superauth@illure.com';
  const managerEmail = 'managerauth@illure.com';
  const pass = 'Password123!';

  let superAdminId: string;
  let managerId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword(pass);

    await prisma.adminUser.deleteMany({
      where: { email: { in: [superAdminEmail, managerEmail] } },
    });

    const superAdmin = await prisma.adminUser.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        name: 'Super Admin User',
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      },
    });
    superAdminId = superAdmin.id;

    const manager = await prisma.adminUser.create({
      data: {
        email: managerEmail,
        passwordHash,
        name: 'Order Manager User',
        role: AdminRole.ORDER_MANAGER,
        isActive: true,
      },
    });
    managerId = manager.id;
  });

  afterAll(async () => {
    await prisma.adminUser.deleteMany({
      where: { email: { in: [superAdminEmail, managerEmail] } },
    });
    await prisma.$disconnect();
  });

  it('should reject requests with 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject requests with 403 when user has insufficient role (ORDER_MANAGER on /api/admin/users)', async () => {
    const managerToken = generateAccessToken({
      adminId: managerId,
      email: managerEmail,
      role: AdminRole.ORDER_MANAGER,
    });

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should allow requests when user has sufficient role (SUPER_ADMIN on /api/admin/users)', async () => {
    const superAdminToken = generateAccessToken({
      adminId: superAdminId,
      email: superAdminEmail,
      role: AdminRole.SUPER_ADMIN,
    });

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.admins)).toBe(true);
  });
});
