import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.utils.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { AdminRole } from '@prisma/client';

describe('Categories API', () => {
  let adminToken: string;
  let adminUserId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    await prisma.category.deleteMany({
      where: { slug: { in: ['woody-test', 'woody-test-updated', 'oriental-test'] } },
    });

    const passwordHash = await hashPassword('Password123!');
    const adminUser = await prisma.adminUser.create({
      data: {
        email: 'admin-cat-test@illure.com',
        passwordHash,
        name: 'Cat Test Admin',
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
    await prisma.category.deleteMany({
      where: { slug: { in: ['woody-test', 'woody-test-updated', 'oriental-test'] } },
    });
    if (adminUserId) {
      await prisma.adminUser.deleteMany({ where: { id: adminUserId } });
    }
    await prisma.$disconnect();
  });

  it('POST /api/admin/categories - should create category with auto-generated slug', async () => {
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Woody Test',
        description: 'Smoky woods and cedar',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category.slug).toBe('woody-test');
    testCategoryId = res.body.data.category.id;
  });

  it('GET /api/admin/categories - should list all categories for admin', async () => {
    const res = await request(app)
      .get('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  it('PATCH /api/admin/categories/:id - should update category details', async () => {
    const res = await request(app)
      .patch(`/api/admin/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Woody Test Updated',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category.name).toBe('Woody Test Updated');
  });

  it('GET /api/categories/public - should list active categories for customer', async () => {
    const res = await request(app).get('/api/categories/public');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });
});
