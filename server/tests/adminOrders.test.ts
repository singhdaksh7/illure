import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.utils.js';

describe('Admin Orders & Lifecycle API', () => {
  let adminToken: string;
  let adminUserId: string;
  let inventoryManagerToken: string;
  let createdOrderId: string;
  let testVariantId: string;

  beforeEach(async () => {
    await prisma.orderItem.deleteMany({});
    await prisma.orderAddress.deleteMany({});
    await prisma.orderStatusHistory.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.adminSession.deleteMany({});
    await prisma.adminUser.deleteMany({});
    await prisma.customer.deleteMany({});

    // Create Admin User
    const passwordHash = await hashPassword('SuperAdmin@Illure2026!');
    const admin = await prisma.adminUser.create({
      data: {
        email: 'orderadmin@illure.com',
        passwordHash,
        name: 'Order Manager',
        role: 'ADMIN',
      },
    });
    adminUserId = admin.id;

    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'orderadmin@illure.com', password: 'SuperAdmin@Illure2026!' });
    adminToken = loginRes.body.data.accessToken;

    // Create Inventory Manager User
    const invPasswordHash = await hashPassword('SuperAdmin@Illure2026!');
    await prisma.adminUser.create({
      data: {
        email: 'invmgr@illure.com',
        passwordHash: invPasswordHash,
        name: 'Inventory Manager',
        role: 'INVENTORY_MANAGER',
        isActive: true,
      },
    });

    const invLoginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'invmgr@illure.com', password: 'SuperAdmin@Illure2026!' });

    if (!invLoginRes.body?.data?.accessToken) {
      throw new Error(`Inventory Manager login failed: ${JSON.stringify(invLoginRes.body)}`);
    }
    inventoryManagerToken = invLoginRes.body.data.accessToken;

    // Create product variant
    const product = await prisma.product.create({
      data: {
        name: 'Amber Nectar',
        slug: 'amber-nectar',
        description: 'Amber scent',
        status: 'ACTIVE',
        variants: {
          create: {
            sizeLabel: '100 ML',
            sku: 'AN-100-TEST',
            price: 3000,
            stockQuantity: 15,
            isActive: true,
          },
        },
      },
      include: { variants: true },
    });
    testVariantId = product.variants[0].id;

    // Create a confirmed COD order directly in DB or via API
    const cust = await request(app)
      .post('/api/auth/customer/register')
      .send({ name: 'Admin Lifecycle User', email: 'adminlife@illure.com', phone: '+918888877777', password: 'Password123!' });
    const customerToken = cust.body.data.accessToken;

    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId: testVariantId, quantity: 2 });

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        paymentMethod: 'COD',
        customerName: 'Admin Lifecycle User',
        customerPhone: '+918888877777',
        customerEmail: 'adminlife@illure.com',
        address: {
          fullName: 'Admin Lifecycle User',
          phone: '+918888877777',
          addressLine1: '50 Palace Road',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302001',
        },
      });

    createdOrderId = orderRes.body.data.id;
  });

  it('GET /api/admin/orders - should list orders with filters and pagination', async () => {
    const res = await request(app)
      .get('/api/admin/orders?status=CONFIRMED')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].id).toBe(createdOrderId);
  });

  it('PATCH /api/admin/orders/:id/status - should enforce valid status transition workflow', async () => {
    // Attempt invalid jump: CONFIRMED -> DELIVERED (invalid transition for ADMIN)
    const invalidRes = await request(app)
      .patch(`/api/admin/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'DELIVERED', note: 'Direct jump attempt' });

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error.code).toBe('INVALID_STATUS_TRANSITION');

    // Valid step: CONFIRMED -> PROCESSING
    const validRes = await request(app)
      .patch(`/api/admin/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PROCESSING', note: 'Processing in warehouse' });

    expect(validRes.status).toBe(200);
    expect(validRes.body.data.status).toBe('PROCESSING');
  });

  it('PATCH /api/admin/orders/:id/status - should restore stock on order cancellation', async () => {
    // Current stock is 13 (15 original - 2 ordered)
    let variant = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
    expect(variant?.stockQuantity).toBe(13);

    // Cancel order
    const cancelRes = await request(app)
      .patch(`/api/admin/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CANCELLED', note: 'Customer requested cancellation' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    // Verify stock restored back to 15
    variant = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
    expect(variant?.stockQuantity).toBe(15);
  });

  it('RBAC - INVENTORY_MANAGER should be forbidden from modifying order status', async () => {
    const res = await request(app)
      .patch(`/api/admin/orders/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${inventoryManagerToken}`)
      .send({ status: 'PROCESSING' });

    expect(res.status).toBe(403);
  });
});
