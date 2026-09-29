import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.utils.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { AdminRole } from '@prisma/client';

describe('Reference Brands API', () => {
  let adminToken: string;
  let adminUserId: string;
  let testBrandId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('Password123!');
    const adminUser = await prisma.adminUser.create({
      data: {
        email: 'admin-brand-test@illure.com',
        passwordHash,
        name: 'Brand Test Admin',
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });
    adminUserId = adminUser.id;

    adminToken = generateAccessToken({
      adminId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });
  });

  afterAll(async () => {
    await prisma.referenceBrand.deleteMany({
      where: { slug: { in: ['tom-ford-test', 'dior-test'] } },
    });
    if (adminUserId) {
      await prisma.adminUser.deleteMany({ where: { id: adminUserId } });
    }
    await prisma.$disconnect();
  });

  it('POST /api/admin/reference-brands - should create reference brand', async () => {
    const res = await request(app)
      .post('/api/admin/reference-brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Tom Ford Test',
        description: 'Luxury inspiration house',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.brand.slug).toBe('tom-ford-test');
    testBrandId = res.body.data.brand.id;
  });

  it('GET /api/admin/reference-brands - should list reference brands', async () => {
    const res = await request(app)
      .get('/api/admin/reference-brands')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.brands)).toBe(true);
  });
});
