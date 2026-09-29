import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.utils.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { AdminRole, Gender, ProductStatus } from '@prisma/client';

describe('Admin Product CRUD API', () => {
  let adminToken: string;
  let adminUserId: string;
  let createdProductId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('Password123!');
    const adminUser = await prisma.adminUser.create({
      data: {
        email: 'admin-prod-test@illure.com',
        passwordHash,
        name: 'Product Test Admin',
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
    if (createdProductId) {
      await prisma.inventoryMovement.deleteMany({ where: { variant: { productId: createdProductId } } });
      await prisma.productVariant.deleteMany({ where: { productId: createdProductId } });
      await prisma.productImage.deleteMany({ where: { productId: createdProductId } });
      await prisma.productCategory.deleteMany({ where: { productId: createdProductId } });
      await prisma.product.deleteMany({ where: { id: createdProductId } });
    }
    if (adminUserId) {
      await prisma.adminUser.deleteMany({ where: { id: adminUserId } });
    }
    await prisma.$disconnect();
  });

  it('POST /api/admin/products - should create product with multiple dynamic variants & images in a transaction', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Royal Velvet Oud',
        shortDescription: 'Deep smoky oud with warm velvet rose.',
        description: 'An opulent artisanal blend inspired by royal Middle Eastern perfumery.',
        inspiredByName: 'Oud Bouquet',
        gender: Gender.UNISEX,
        fragranceFamily: 'Woody & Smoky',
        topNotes: ['Saffron', 'Rosewater'],
        heartNotes: ['Smoky Oud Wood', 'Praline'],
        baseNotes: ['Vanilla', 'Guaiac Wood'],
        status: ProductStatus.ACTIVE,
        featured: true,
        variants: [
          {
            sizeLabel: '3 ML Sample',
            sizeMl: 3,
            sku: 'RVO-003-TEST',
            price: 399,
            stockQuantity: 50,
            lowStockThreshold: 5,
            isActive: true,
            sortOrder: 1,
          },
          {
            sizeLabel: '6 ML Attar',
            sizeMl: 6,
            sku: 'RVO-006-TEST',
            price: 749,
            stockQuantity: 30,
            lowStockThreshold: 5,
            isActive: true,
            sortOrder: 2,
          },
          {
            sizeLabel: '12 ML Pocket Luxury',
            sizeMl: 12,
            sku: 'RVO-012-TEST',
            price: 1399,
            stockQuantity: 20,
            lowStockThreshold: 5,
            isActive: true,
            sortOrder: 3,
          },
        ],
        images: [
          {
            url: 'https://illurefragrance.com/images/oud_wood.jpg',
            altText: 'Royal Velvet Oud Bottle',
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.slug).toBe('royal-velvet-oud');
    expect(res.body.data.product.variants.length).toBe(3);
    createdProductId = res.body.data.product.id;
  });

  it('POST /api/admin/products - should reject duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Duplicate SKU Product',
        description: 'Should fail due to SKU collision',
        status: ProductStatus.DRAFT,
        variants: [
          {
            sizeLabel: '100 ML',
            sku: 'RVO-003-TEST', // Same SKU as created above
            price: 1999,
            stockQuantity: 10,
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SKU_EXISTS');
  });

  it('GET /api/admin/products - should list admin products with status and variant metrics', async () => {
    const res = await request(app)
      .get('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.pagination.total).toBeGreaterThan(0);
  });

  it('PATCH /api/admin/products/:id - should update product metadata', async () => {
    const res = await request(app)
      .patch(`/api/admin/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        featured: false,
        bestseller: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.bestseller).toBe(true);
    expect(res.body.data.product.featured).toBe(false);
  });

  it('DELETE /api/admin/products/:id - should archive active product (soft lifecycle)', async () => {
    const res = await request(app)
      .delete(`/api/admin/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.status).toBe(ProductStatus.ARCHIVED);
  });
});
