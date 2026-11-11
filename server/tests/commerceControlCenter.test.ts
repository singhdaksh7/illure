import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { generateAccessToken } from '../src/utils/jwt.utils.js';
import { NotificationsService } from '../src/modules/notifications/notifications.service.js';

describe('İLLURÊ Commerce Control Center (Phases 3H, 4, 5, 6, 7, 8)', () => {
  let customerToken: string;
  let customerId: string;
  let adminToken: string;
  let testVariantId: string;
  let testProductId: string;
  let testOrderId: string;

  beforeEach(async () => {
    await prisma.notificationJob.deleteMany({});
    await prisma.giftCard.deleteMany({});
    await prisma.customerScentProfile.deleteMany({});
    await prisma.productReview.deleteMany({});
    await prisma.loyaltyTransaction.deleteMany({});
    await prisma.loyaltyAccount.deleteMany({});
    await prisma.referral.deleteMany({});
    await prisma.orderReturnRequest.deleteMany({});
    await prisma.riskFlag.deleteMany({});
    await prisma.pincodeRule.deleteMany({});
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

    // Register customer
    const custRes = await request(app)
      .post('/api/auth/customer/register')
      .send({
        name: 'Aurelia Vance',
        email: 'aurelia@illure.com',
        phone: '+919876543210',
        password: 'Password123!',
      });
    customerToken = custRes.body.data.accessToken;
    customerId = custRes.body.data.customer.id;

    // Create and login test admin
    const passwordHash = await hashPassword('AdminPassword123!');
    const adminUser = await prisma.adminUser.upsert({
      where: { email: 'admin_test@illure.com' },
      create: {
        email: 'admin_test@illure.com',
        passwordHash,
        name: 'Test Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      update: { passwordHash, isActive: true },
    });
    adminToken = generateAccessToken({
      adminId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    // Create test product with variant
    const product = await prisma.product.create({
      data: {
        name: 'Obsidian Noir',
        slug: 'obsidian-noir',
        description: 'Deep smoky amber and birch tar.',
        fragranceFamily: 'Woody',
        status: 'ACTIVE',
        variants: {
          create: {
            sizeLabel: '50 ML',
            sku: 'OBS-50-TEST',
            price: 2490,
            stockQuantity: 10,
            isActive: true,
          },
        },
      },
      include: { variants: true },
    });
    testProductId = product.id;
    testVariantId = product.variants[0].id;

    // Create a confirmed order for customer
    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD-TEST-CCC-1',
        customerId,
        customerName: 'Aurelia Vance',
        customerPhone: '+919876543210',
        customerEmail: 'aurelia@illure.com',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 2490,
        totalAmount: 2490,
        items: {
          create: {
            productId: testProductId,
            variantId: testVariantId,
            productName: 'Obsidian Noir',
            sizeLabel: '50 ML',
            sku: 'OBS-50-TEST',
            unitPrice: 2490,
            quantity: 1,
            lineTotal: 2490,
          },
        },
        shippingAddress: {
          create: {
            fullName: 'Aurelia Vance',
            phone: '+919876543210',
            addressLine1: '12 Crescent Row',
            city: 'New Delhi',
            state: 'Delhi',
            postalCode: '110030',
          },
        },
      },
    });
    testOrderId = order.id;
  });

  // ==========================================
  // PHASE 3H: ASYNC NOTIFICATION QUEUE & SEARCH
  // ==========================================
  describe('Phase 3H: Async Notification Queue & Search Sanitization', () => {
    it('should enqueue notification job into database queue and drain successfully', async () => {
      const job = await NotificationsService.enqueue({
        type: 'STOCK_ALERT',
        payload: {
          to: 'aurelia@illure.com',
          productName: 'Obsidian Noir',
          size: '50 ML',
          productUrl: '/fragrance/obsidian-noir',
          price: 2490,
        },
      });

      expect(job.id).toBeDefined();
      expect(job.status).toBe('PENDING');

      const drainRes = await NotificationsService.drainQueue();
      expect(drainRes.processed).toBe(1);

      const updatedJob = await prisma.notificationJob.findUnique({ where: { id: job.id } });
      expect(updatedJob?.status).toBe('SENT');
    });

    it('should sanitize search query against injection and return matched products', async () => {
      const res = await request(app)
        .get('/api/products/search?q=Obsidian%\'--')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.fragrances.length).toBeGreaterThan(0);
      expect(res.body.data.fragrances[0].name).toBe('Obsidian Noir');
    });
  });

  // ==========================================
  // PHASE 4: GIFTING & GIFT CARDS
  // ==========================================
  describe('Phase 4: Gifting & Gift Cards', () => {
    it('should issue a gift card and allow balance check and partial redemption', async () => {
      const issueRes = await request(app)
        .post('/api/gifting/gift-cards')
        .send({
          amount: 5000,
          recipientEmail: 'friend@illure.com',
          recipientName: 'Friend Vance',
          senderName: 'Aurelia',
          message: 'Enjoy your bespoke scent.',
        })
        .expect(201);

      const code = issueRes.body.data.code;
      expect(code).toMatch(/^ILR-/);

      // Check balance
      const balanceRes = await request(app)
        .get(`/api/gifting/gift-cards/${code}/balance`)
        .expect(200);

      expect(balanceRes.body.data.currentBalance).toBe(5000);

      // Redeem partial ₹2000
      const redeemRes = await request(app)
        .post('/api/gifting/gift-cards/redeem')
        .send({ code, amount: 2000 })
        .expect(200);

      expect(redeemRes.body.data.amountDeducted).toBe(2000);
      expect(redeemRes.body.data.remainingBalance).toBe(3000);
      expect(redeemRes.body.data.status).toBe('ACTIVE');
    });

    it('should return free sample eligibility based on order spend threshold', async () => {
      const resUnder = await request(app).get('/api/gifting/free-samples/eligibility?subtotal=1500');
      expect(resUnder.body.data.eligible).toBe(false);

      const resOver = await request(app).get('/api/gifting/free-samples/eligibility?subtotal=2500');
      expect(resOver.body.data.eligible).toBe(true);
      expect(resOver.body.data.allowedCount).toBe(2);
    });
  });

  // ==========================================
  // PHASE 5: RETENTION & REVIEWS
  // ==========================================
  describe('Phase 5: Customer Retention & Verified Reviews', () => {
    it('should save customer scent profile and return personalized recommendations', async () => {
      await request(app)
        .put('/api/retention/scent-profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          preferredFamilies: ['Woody'],
          likedNotes: ['birch tar', 'amber'],
          moods: ['mysterious'],
        })
        .expect(200);

      const getProfile = await request(app)
        .get('/api/retention/scent-profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(getProfile.body.data.preferredFamilies).toContain('Woody');

      // Buy Again items
      const buyAgain = await request(app)
        .get('/api/retention/buy-again')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(buyAgain.body.data.length).toBe(1);
      expect(buyAgain.body.data[0].productName).toBe('Obsidian Noir');
    });

    it('should accept verified product review from customer who purchased item', async () => {
      const reviewRes = await request(app)
        .post('/api/retention/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          rating: 5,
          scentRating: 5,
          longevityRating: 5,
          comment: 'Incredible depth and longevity. Highly recommended.',
        })
        .expect(201);

      expect(reviewRes.body.data.isVerified).toBe(true);

      const productReviews = await request(app)
        .get(`/api/retention/products/${testProductId}/reviews`)
        .expect(200);

      expect(productReviews.body.data.total).toBe(1);
      expect(productReviews.body.data.averageRating).toBe(5);
    });
  });

  // ==========================================
  // PHASE 6: LOYALTY & REWARDS
  // ==========================================
  describe('Phase 6: Loyalty Ledger & Drops', () => {
    it('should initialize customer loyalty account with welcome points and allow redemption', async () => {
      const accRes = await request(app)
        .get('/api/loyalty/account')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(accRes.body.data.balance).toBe(100);

      // Redeem points
      const redeemRes = await request(app)
        .post('/api/loyalty/redeem')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ points: 100 })
        .expect(200);

      expect(redeemRes.body.data.discountInr).toBe(100);
      expect(redeemRes.body.data.remainingBalance).toBe(0);
    });

    it('should generate referral code for customer', async () => {
      const refRes = await request(app)
        .get('/api/loyalty/referral')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(refRes.body.data.code).toMatch(/^ILR-/);
    });
  });

  // ==========================================
  // PHASE 7: OPERATIONS, RETURNS & PINCODE
  // ==========================================
  describe('Phase 7: Operations, Cancellations & Invoicing', () => {
    it('should allow customer cancellation on unfulfilled order and restore variant stock', async () => {
      // Stock before cancel is 10
      const cancelRes = await request(app)
        .post(`/api/operations/orders/${testOrderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Changed mind before dispatch' })
        .expect(200);

      expect(cancelRes.body.data.status).toBe('CANCELLED');

      const variant = await prisma.productVariant.findUnique({ where: { id: testVariantId } });
      expect(variant?.stockQuantity).toBe(11); // 10 + 1 restored
    });

    it('should verify pincode serviceability and fetch order invoice data', async () => {
      const pincodeRes = await request(app)
        .get('/api/operations/pincode/110030')
        .expect(200);

      expect(pincodeRes.body.data.isServiceable).toBe(true);

      const invoiceRes = await request(app)
        .get(`/api/operations/orders/${testOrderId}/invoice`)
        .expect(200);

      expect(invoiceRes.body.data.invoiceNumber).toContain('ORD-TEST-CCC-1');
      expect(invoiceRes.body.data.brand.name).toBe('İLLURÊ FRAGRANCE');
    });
  });

  // ==========================================
  // PHASE 8: EXECUTIVE COMMERCE ANALYTICS
  // ==========================================
  describe('Phase 8: Executive Commerce Analytics & CSV Export', () => {
    it('should compute real executive commerce metrics and export orders CSV', async () => {
      const metricsRes = await request(app)
        .get('/api/admin/analytics/executive?days=30')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(metricsRes.body.data.metrics.totalRevenue).toBeGreaterThanOrEqual(2490);
      expect(metricsRes.body.data.metrics.totalOrders).toBeGreaterThanOrEqual(1);

      const csvRes = await request(app)
        .get('/api/admin/analytics/export/orders.csv')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(csvRes.headers['content-type']).toContain('text/csv');
      expect(csvRes.text).toContain('Order Number,Date,Customer Name');
      expect(csvRes.text).toContain('ORD-TEST-CCC-1');
    });
  });
});
