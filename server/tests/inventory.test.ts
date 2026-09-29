import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { generateAccessToken } from '../src/utils/jwt.utils.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { AdminRole, Gender, ProductStatus } from '@prisma/client';

describe('Inventory Management & Movement History API', () => {
  let inventoryManagerToken: string;
  let adminUserId: string;
  let productId: string;
  let variantId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('Password123!');
    const adminUser = await prisma.adminUser.create({
      data: {
        email: 'inv-manager-1@illure.com',
        passwordHash,
        name: 'Inventory Manager',
        role: AdminRole.INVENTORY_MANAGER,
        isActive: true,
      },
    });
    adminUserId = adminUser.id;

    inventoryManagerToken = generateAccessToken({
      adminId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // Create a product & variant for inventory testing
    const product = await prisma.product.create({
      data: {
        name: 'Inventory Test Fragrance',
        slug: 'inventory-test-fragrance',
        description: 'Test product for inventory movements',
        gender: Gender.UNISEX,
        status: ProductStatus.ACTIVE,
        variants: {
          create: [
            {
              sizeLabel: '100 ML',
              sku: 'INV-TEST-100',
              price: 1999,
              stockQuantity: 10,
              lowStockThreshold: 5,
              isActive: true,
            },
          ],
        },
      },
      include: { variants: true },
    });

    productId = product.id;
    variantId = product.variants[0].id;
  });

  afterAll(async () => {
    await prisma.inventoryMovement.deleteMany({ where: { variantId } });
    await prisma.productVariant.deleteMany({ where: { productId } });
    await prisma.product.deleteMany({ where: { id: productId } });
    if (adminUserId) {
      await prisma.adminUser.deleteMany({ where: { id: adminUserId } });
    }
    await prisma.$disconnect();
  });

  it('POST /api/admin/inventory/:variantId/adjust - should successfully increase stock and record movement', async () => {
    const res = await request(app)
      .post(`/api/admin/inventory/${variantId}/adjust`)
      .set('Authorization', `Bearer ${inventoryManagerToken}`)
      .send({
        quantityDelta: 15,
        reason: 'New stock shipment arrived',
        reference: 'PO-2026-001',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.variant.stockQuantity).toBe(25);
    expect(res.body.data.movement.quantity).toBe(15);
    expect(res.body.data.movement.reason).toBe('New stock shipment arrived');
  });

  it('POST /api/admin/inventory/:variantId/adjust - should reject negative stock result', async () => {
    const res = await request(app)
      .post(`/api/admin/inventory/${variantId}/adjust`)
      .set('Authorization', `Bearer ${inventoryManagerToken}`)
      .send({
        quantityDelta: -50,
        reason: 'Attempt excessive stock removal',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('GET /api/admin/inventory/movements - should return audit movement history with pagination', async () => {
    const res = await request(app)
      .get(`/api/admin/inventory/movements?variantId=${variantId}`)
      .set('Authorization', `Bearer ${inventoryManagerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.pagination.total).toBeGreaterThan(0);
  });

  it('GET /api/admin/inventory/low-stock - should query low stock variants', async () => {
    // Lower stock below threshold (5)
    await request(app)
      .post(`/api/admin/inventory/${variantId}/adjust`)
      .set('Authorization', `Bearer ${inventoryManagerToken}`)
      .send({
        quantityDelta: -22, // Stock becomes 3 (below threshold 5)
        reason: 'Sales deduction',
      });

    const res = await request(app)
      .get('/api/admin/inventory/low-stock')
      .set('Authorization', `Bearer ${inventoryManagerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.lowStockVariants)).toBe(true);
    expect(res.body.data.lowStockVariants.some((v: any) => v.id === variantId)).toBe(true);
  });
});
