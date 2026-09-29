import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Razorpay Payments API', () => {
  let customerToken: string;
  let testVariantId: string;
  let createdOrderId: string;
  let createdOrderNumber: string;

  beforeEach(async () => {
    await prisma.processedWebhookEvent.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.orderAddress.deleteMany({});
    await prisma.orderStatusHistory.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.customer.deleteMany({});

    const cust = await request(app)
      .post('/api/auth/customer/register')
      .send({ name: 'Razorpay User', email: 'rzp@illure.com', phone: '+919999988888', password: 'Password123!' });
    customerToken = cust.body.data.accessToken;

    const product = await prisma.product.create({
      data: {
        name: 'Velvet Oud',
        slug: 'velvet-oud',
        description: 'Velvet fragrance',
        status: 'ACTIVE',
        variants: {
          create: {
            sizeLabel: '50 ML',
            sku: 'VO-50-TEST',
            price: 2000,
            stockQuantity: 10,
            isActive: true,
          },
        },
      },
      include: { variants: true },
    });
    testVariantId = product.variants[0].id;

    // Add item to cart
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ variantId: testVariantId, quantity: 1 });

    // Create Razorpay pending order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        paymentMethod: 'RAZORPAY',
        customerName: 'Razorpay User',
        customerPhone: '+919999988888',
        customerEmail: 'rzp@illure.com',
        address: {
          fullName: 'Razorpay User',
          phone: '+919999988888',
          addressLine1: '100 Penthouse Way',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
      });

    createdOrderId = orderRes.body.data.id;
    createdOrderNumber = orderRes.body.data.orderNumber;
  });

  it('POST /api/payments/razorpay/create-order - should generate Razorpay order ID and paise amount', async () => {
    const res = await request(app)
      .post('/api/payments/razorpay/create-order')
      .send({ orderId: createdOrderId });

    expect(res.status).toBe(200);
    expect(res.body.data.razorpayOrderId).toMatch(/^order_/);
    expect(res.body.data.amount).toBe(200000); // 2000 price + 0 shipping (subtotal >= 999 threshold) = 2000 * 100 paise
  });

  it('POST /api/payments/razorpay/verify - should reject invalid signature', async () => {
    const res = await request(app)
      .post('/api/payments/razorpay/verify')
      .send({
        orderId: createdOrderId,
        razorpay_order_id: 'order_fake123',
        razorpay_payment_id: 'pay_fake123',
        razorpay_signature: 'invalid_signature_hash',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_SIGNATURE');
  });

  it('POST /api/payments/razorpay/verify - should verify valid payment, deduct stock, and be idempotent', async () => {
    // Create razorpay order first
    const rzpOrder = await request(app)
      .post('/api/payments/razorpay/create-order')
      .send({ orderId: createdOrderId });

    const razorpay_order_id = rzpOrder.body.data.razorpayOrderId;

    const res = await request(app)
      .post('/api/payments/razorpay/verify')
      .send({
        orderId: createdOrderId,
        razorpay_order_id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'mock_valid_signature',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.paymentStatus).toBe('PAID');
    expect(res.body.data.status).toBe('CONFIRMED');

    // Verify stock deducted
    const variant = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
    expect(variant?.stockQuantity).toBe(9); // 10 - 1

    // Retry verify (Idempotency)
    const retryRes = await request(app)
      .post('/api/payments/razorpay/verify')
      .send({
        orderId: createdOrderId,
        razorpay_order_id,
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'mock_valid_signature',
      });

    expect(retryRes.status).toBe(200);
    expect(retryRes.body.data.alreadyProcessed).toBe(true);

    // Stock must NOT be deducted a second time
    const variant2 = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
    expect(variant2?.stockQuantity).toBe(9);
  });

  it('POST /api/payments/razorpay/webhook - should handle valid webhook idempotently', async () => {
    const payload = {
      event_id: 'evt_test_webhook_123',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_web123',
            order_id: 'order_web123',
            amount: 200000,
          },
        },
      },
    };

    const res = await request(app)
      .post('/api/payments/razorpay/webhook')
      .set('x-razorpay-signature', 'mock_webhook_signature')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('processed');

    // Duplicate webhook send
    const dupRes = await request(app)
      .post('/api/payments/razorpay/webhook')
      .set('x-razorpay-signature', 'mock_webhook_signature')
      .send(payload);

    expect(dupRes.status).toBe(200);
    expect(dupRes.body.status).toBe('already_processed');
  });
});
