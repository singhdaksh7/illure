import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Orders & Checkout API', () => {
  let customerToken: string;
  let customerId: string;
  let customer2Token: string;
  let customer2Id: string;
  let testProductId: string;
  let testVariantId: string;
  let couponCode: string;

  beforeEach(async () => {
    // Clean orders, Carts, Carts items, customers, products
    await prisma.orderItem.deleteMany({});
    await prisma.orderAddress.deleteMany({});
    await prisma.orderStatusHistory.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.productCategory.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.customerSession.deleteMany({});
    await prisma.customerAddress.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.coupon.deleteMany({});
    await prisma.shippingSetting.deleteMany({});

    // Setup Shipping settings
    await prisma.shippingSetting.create({
      data: { flatRate: 99, freeShippingThreshold: 999, isEnabled: true },
    });

    // Create Customer 1
    const loginRes1 = await request(app)
      .post('/api/auth/customer/register')
      .send({ name: 'Order Tester', email: 'ordertester@illure.com', phone: '+919876543210', password: 'Password123!' });
    customerToken = loginRes1.body.data.accessToken;
    customerId = loginRes1.body.data.customer.id;

    // Create Customer 2
    const cust2Res = await request(app)
      .post('/api/auth/customer/register')
      .send({ name: 'Customer Two', email: 'customer2@illure.com', phone: '+919876543211', password: 'Password123!' });
    customer2Token = cust2Res.body.data.accessToken;
    customer2Id = cust2Res.body.data.customer.id;

    // Create Category & Product
    const cat = await prisma.category.create({
      data: { name: 'Extrait', slug: 'extrait' },
    });

    const product = await prisma.product.create({
      data: {
        name: 'Royal Oud Exquisite',
        slug: 'royal-oud-exquisite',
        description: 'Luxury Oud',
        inspiredByName: 'Oud Wood',
        status: 'ACTIVE',
        productCategories: { create: { categoryId: cat.id } },
        variants: {
          create: {
            sizeLabel: '100 ML',
            sku: 'RO-100-TEST',
            price: 1500,
            stockQuantity: 20,
            isActive: true,
          },
        },
      },
      include: { variants: true },
    });

    testProductId = product.id;
    testVariantId = product.variants[0].id;

    // Create Coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: 'LUXURY200',
        type: 'FIXED',
        value: 200,
        minimumOrderAmount: 1000,
        isActive: true,
      },
    });
    couponCode = coupon.code;
  });

  describe('POST /api/checkout/summary', () => {
    it('should reject summary for an empty cart', async () => {
      const res = await request(app)
        .post('/api/checkout/summary')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('CART_EMPTY');
    });

    it('should calculate correct summary including subtotal, coupon discount, and free shipping', async () => {
      // Add item to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ variantId: testVariantId, quantity: 1 });

      const res = await request(app)
        .post('/api/checkout/summary')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ couponCode });

      expect(res.status).toBe(200);
      expect(res.body.data.subtotal).toBe(1500);
      expect(res.body.data.discountAmount).toBe(200);
      // Net subtotal (1300) >= freeShippingThreshold (999) => shipping = 0
      expect(res.body.data.shippingAmount).toBe(0);
      expect(res.body.data.grandTotal).toBe(1300);
    });
  });

  describe('POST /api/orders (Order Creation)', () => {
    it('should create COD order, snapshot items and address, deduct stock, and clear cart', async () => {
      // Add item to cart
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ variantId: testVariantId, quantity: 2 });

      const orderPayload = {
        paymentMethod: 'COD',
        customerName: 'Order Tester',
        customerPhone: '+919876543210',
        customerEmail: 'ordertester@illure.com',
        couponCode,
        address: {
          fullName: 'Order Tester',
          phone: '+919876543210',
          addressLine1: '42 Luxury Estate',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
        },
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(orderPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.orderNumber).toMatch(/^ILL-\d{8}-\d{6}$/);
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(res.body.data.paymentStatus).toBe('COD_PENDING');
      expect(res.body.data.totalAmount).toBe(2800); // (1500 * 2) - 200 discount + 0 shipping

      // Check stock deduction
      const updatedVariant = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
      expect(updatedVariant?.stockQuantity).toBe(18); // 20 - 2

      // Check coupon usage count
      const updatedCoupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      expect(updatedCoupon?.usageCount).toBe(1);

      // Check cart cleared
      const cartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(cartRes.body.data.cart.items.length).toBe(0);
    });
  });

  describe('Customer Order History & Isolation', () => {
    it('should prevent customer 2 from accessing customer 1 order', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ variantId: testVariantId, quantity: 1 });

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentMethod: 'COD',
          customerName: 'Order Tester',
          customerPhone: '+919876543210',
          customerEmail: 'ordertester@illure.com',
          address: {
            fullName: 'Order Tester',
            phone: '+919876543210',
            addressLine1: '42 Manor',
            city: 'Delhi',
            state: 'Delhi',
            postalCode: '110001',
          },
        });

      const orderNumber = createRes.body.data.orderNumber;

      // Customer 2 tries to fetch Customer 1's order details
      const fetchRes = await request(app)
        .get(`/api/customer/orders/${orderNumber}`)
        .set('Authorization', `Bearer ${customer2Token}`);

      expect(fetchRes.status).toBe(404);
    });
  });
});
