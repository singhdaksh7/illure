import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Shopping Cart API & Stock Enforcement', () => {
  let productId: string;
  let variantId: string;
  let outOfStockVariantId: string;
  let giftPackagingId: string;
  let customerToken: string;
  let customerId: string;

  beforeAll(async () => {
    // Create test product with active & out of stock variants
    const product = await prisma.product.create({
      data: {
        name: 'Cart Test Perfume',
        slug: 'cart-test-perfume',
        description: 'Test product for shopping cart.',
        status: 'ACTIVE',
        variants: {
          create: [
            {
              sizeLabel: '50 ML',
              sku: 'CART-TEST-50ML',
              price: 500.0,
              stockQuantity: 10,
              isActive: true,
            },
            {
              sizeLabel: '100 ML',
              sku: 'CART-TEST-100ML',
              price: 900.0,
              stockQuantity: 0,
              isActive: true,
            },
          ],
        },
      },
      include: { variants: true },
    });

    productId = product.id;
    variantId = product.variants.find((v) => v.stockQuantity > 0)!.id;
    outOfStockVariantId = product.variants.find((v) => v.stockQuantity === 0)!.id;

    // Create test gift packaging
    const gift = await prisma.giftPackaging.create({
      data: {
        name: 'Cart Test Gift Box',
        price: 100.0,
        isActive: true,
      },
    });
    giftPackagingId = gift.id;

    // Register Customer
    const res = await request(app).post('/api/auth/customer/register').send({
      name: 'Cart Test Customer',
      email: 'cartcust@example.com',
      phone: '9876599999',
      password: 'Password123!',
    });
    customerToken = res.body.data.accessToken;
    customerId = res.body.data.customer.id;
  });

  afterAll(async () => {
    await prisma.cartItem.deleteMany({ where: { productId } });
    await prisma.productVariant.deleteMany({ where: { productId } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.giftPackaging.deleteMany({ where: { id: giftPackagingId } });
    await prisma.customer.deleteMany({ where: { id: customerId } });
  });

  it('POST /api/cart/items - should create guest cart item with accurate DB pricing and packaging', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .send({
        variantId,
        quantity: 2,
        giftPackagingId,
        giftMessage: 'With Love',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cart.items.length).toBe(1);

    const item = res.body.data.cart.items[0];
    expect(item.variantPrice).toBe(500);
    expect(item.giftPackagingPrice).toBe(100);
    expect(item.unitPrice).toBe(600);
    expect(item.lineTotal).toBe(1200); // (500 + 100) * 2
    expect(res.body.data.cart.subtotal).toBe(1200);
  });

  it('POST /api/cart/items - should reject out of stock variant', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .send({
        variantId: outOfStockVariantId,
        quantity: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/cart/items - should reject quantity exceeding available stock', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .send({
        variantId,
        quantity: 100, // Stock is only 10
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/cart/merge - should merge guest cart into customer cart', async () => {
    // Add item as guest first
    const guestRes = await request(app)
      .post('/api/cart/items')
      .send({
        variantId,
        quantity: 1,
      });

    const sessionKey = guestRes.body.data.sessionKey;
    expect(sessionKey).toBeDefined();

    // Merge into customer cart
    const mergeRes = await request(app)
      .post('/api/cart/merge')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ sessionKey });

    expect(mergeRes.status).toBe(200);
    expect(mergeRes.body.data.cart.customerId).toBe(customerId);
    expect(mergeRes.body.data.cart.items.length).toBeGreaterThan(0);
  });
});
