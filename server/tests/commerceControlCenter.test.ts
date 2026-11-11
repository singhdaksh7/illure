import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { generateAccessToken } from '../src/utils/jwt.utils.js';
import { NotificationsService } from '../src/modules/notifications/notifications.service.js';
import { GiftingService } from '../src/modules/gifting/gifting.service.js';
import { LoyaltyService } from '../src/modules/loyalty/loyalty.service.js';
import { ShippingProviderService } from '../src/modules/shipping/shipping.provider.js';

describe('İLLURÊ Commerce Control Center (Roadmap Verification & Security)', () => {
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
        .get('/api/products/search?q=Obsidian%\\\'--')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.fragrances.length).toBeGreaterThan(0);
      expect(res.body.data.fragrances[0].name).toBe('Obsidian Noir');
    });
  });

  // ==========================================
  // PHASE 4: GIFTING & CONCURRENCY
  // ==========================================
  describe('Phase 4: Gifting & Gift Card Concurrency Protection', () => {
    it('should prevent gift card from going negative under sequential/concurrent redemptions', async () => {
      // Issue ₹1000 card
      const card = await GiftingService.issueGiftCard({ amount: 1000 });

      // First redeem 700
      const r1 = await GiftingService.redeem(card.code, 700);
      expect(r1.remainingBalance).toBe(300);

      // Second redeem 700 attempts against remaining 300
      const r2 = await GiftingService.redeem(card.code, 700);
      expect(r2.amountDeducted).toBe(300);
      expect(r2.remainingBalance).toBe(0);

      const updated = await prisma.giftCard.findUnique({ where: { code: card.code } });
      expect(Number(updated?.currentBalance)).toBe(0);
    });

    it('should safely return CONFIGURATION_REQUIRED for free samples when unconfigured', async () => {
      // Ensure free_samples feature is disabled / unconfigured
      await prisma.commerceFeature.upsert({
        where: { key: 'free_samples' },
        create: {
          key: 'free_samples',
          name: 'Free Samples',
          description: 'Free samples at checkout',
          group: 'GIFTING',
          isEnabled: false,
          status: 'CONFIGURATION_REQUIRED',
        },
        update: {
          isEnabled: false,
          status: 'CONFIGURATION_REQUIRED',
          config: {},
        },
      });

      const res = await request(app).get('/api/gifting/free-samples/eligibility?subtotal=2500');
      expect(res.body.data.status).toBe('CONFIGURATION_REQUIRED');
      expect(res.body.data.eligible).toBe(false);
      expect(res.body.data.availableSamples.length).toBe(0);
    });
  });

  // ==========================================
  // PHASE 5: RETENTION & REVIEWS
  // ==========================================
  describe('Phase 5: Customer Retention, Reviews & Photo Security', () => {
    it('should reject invalid photo upload extensions for reviews', async () => {
      const res = await request(app)
        .post('/api/retention/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          rating: 5,
          comment: 'Great scent',
          mediaUrls: ['https://illure.in/uploads/malicious.exe'],
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_MEDIA_TYPE');
    });

    it('should accept valid photo review from verified buyer', async () => {
      const res = await request(app)
        .post('/api/retention/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          rating: 5,
          comment: 'Flawless projection and blend.',
          mediaUrls: ['https://illure.in/uploads/bottle.webp'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.isVerified).toBe(true);
    });
  });

  // ==========================================
  // PHASE 6: LOYALTY & REFERRALS IDEMPOTENCY
  // ==========================================
  describe('Phase 6: Loyalty & Referral Idempotency', () => {
    it('should not award duplicate loyalty points for the same order', async () => {
      // Enable loyalty feature with config
      await prisma.commerceFeature.upsert({
        where: { key: 'loyalty' },
        create: {
          key: 'loyalty',
          name: 'Loyalty Program',
          description: 'Customer loyalty program',
          group: 'LOYALTY',
          isEnabled: true,
          status: 'ACTIVE',
          config: { earnRatePerInr: 0.1 },
        },
        update: { isEnabled: true, status: 'ACTIVE', config: { earnRatePerInr: 0.1 } },
      });

      const firstAward = await LoyaltyService.awardPointsForOrder(customerId, testOrderId, 2490);
      expect(firstAward).not.toBeNull();

      // Second award with same orderId
      const secondAward = await LoyaltyService.awardPointsForOrder(customerId, testOrderId, 2490);
      expect(secondAward).toBeNull(); // Deduplicated
    });

    it('should process referral reward only once per code (idempotency)', async () => {
      // Create referral
      const ref = await prisma.referral.create({
        data: { referrerId: customerId, code: 'ILR-REF-TEST' },
      });

      const newCust = await prisma.customer.create({
        data: {
          name: 'Referred Friend',
          email: 'friend@illure.com',
          phone: '+919876543299',
        },
      });

      const res1 = await LoyaltyService.processReferralOrder('ILR-REF-TEST', newCust.id, 'ORD-REF-1', 2500);
      expect(res1?.success).toBe(true);

      const res2 = await LoyaltyService.processReferralOrder('ILR-REF-TEST', newCust.id, 'ORD-REF-1', 2500);
      expect(res2?.success).toBe(false);
      expect(res2?.reason).toBe('REWARD_ALREADY_CLAIMED');
    });
  });

  // ==========================================
  // PHASE 7: OPERATIONS, INVOICE & TIMELINE
  // ==========================================
  describe('Phase 7: Operations, Real Timeline & Invoice Safety', () => {
    it('should safely return CONFIGURATION_REQUIRED for invoices if legal info is missing', async () => {
      // Ensure invoices feature has no legal business details
      await prisma.commerceFeature.upsert({
        where: { key: 'invoices' },
        create: {
          key: 'invoices',
          name: 'Tax Invoices',
          description: 'Tax invoices',
          group: 'ORDERS',
          isEnabled: true,
          status: 'CONFIGURATION_REQUIRED',
          config: {},
        },
        update: { config: {}, status: 'CONFIGURATION_REQUIRED' },
      });

      const res = await request(app).get(`/api/operations/orders/${testOrderId}/invoice`);
      expect(res.body.data.status).toBe('CONFIGURATION_REQUIRED');
      expect(res.body.data.brand).toBeNull();
    });

    it('should return truthful order timeline from real database status records', async () => {
      const res = await request(app).get(`/api/operations/orders/${testOrderId}/timeline`);
      expect(res.status).toBe(200);
      expect(res.body.data.timeline.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.timeline[0].status).toBe('ORDER_PLACED');
    });

    it('should report CONFIGURATION_REQUIRED for shipping provider when courier API keys are absent', async () => {
      const shipment = await ShippingProviderService.createOrderShipment(testOrderId);
      expect(shipment.status).toBe('CONFIGURATION_REQUIRED');
    });
  });

  // ==========================================
  // PHASE 8: EXECUTIVE ANALYTICS & CSV SAFETY
  // ==========================================
  describe('Phase 8: Executive Analytics & CSV Formula Injection Protection', () => {
    it('should neutralize formula injection in CSV export', async () => {
      // Create order with formula injection attempt
      await prisma.order.create({
        data: {
          orderNumber: 'ORD-INJ-1',
          customerName: '=cmd|"/C calc"!A0',
          customerPhone: '+919999999999',
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal: 1000,
          totalAmount: 1000,
        },
      });

      const csvRes = await request(app)
        .get('/api/admin/analytics/export/orders.csv')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify cell was neutralized with leading single quote inside quotes
      expect(csvRes.text).toContain("\"'=cmd|\"\"/C calc\"\"!A0\"");
    });
  });
});
