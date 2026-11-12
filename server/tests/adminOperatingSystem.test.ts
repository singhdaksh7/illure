import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { generateAccessToken } from '../src/utils/jwt.utils.js';
import { encryptSecret, decryptSecret, maskSecret } from '../src/utils/crypto.utils.js';
import { IntegrationsService } from '../src/modules/integrations/integrations.service.js';
import { StorageService } from '../src/modules/storage/storage.service.js';
import { ContentService } from '../src/modules/content/content.service.js';
import { ShiprocketService } from '../src/modules/shipping/shiprocket.service.js';
import { CustomerAuthService } from '../src/modules/customers/customerAuth.service.js';

describe('İLLURÊ Complete Ecommerce Operating System & Security Test Suite', () => {
  let superAdminToken: string;
  let superAdminId: string;
  let regularCustomerToken: string;
  let regularCustomerId: string;

  beforeEach(async () => {
    // Clear test tables
    await prisma.webhookLog.deleteMany({});
    await prisma.shipment.deleteMany({});
    await prisma.integrationConfig.deleteMany({});
    await prisma.urlRedirect.deleteMany({});
    await prisma.banner.deleteMany({});
    await prisma.announcementTicker.deleteMany({});
    await prisma.staticPage.deleteMany({});
    await prisma.mediaItem.deleteMany({});
    await prisma.commerceEventLog.deleteMany({});
    await prisma.notificationJob.deleteMany({});

    // Ensure Super Admin
    const pwdHash = await hashPassword('SuperAdminPass123!');
    const admin = await prisma.adminUser.upsert({
      where: { email: 'superadmin-os@illurefragrance.com' },
      update: { passwordHash: pwdHash, role: 'SUPER_ADMIN', isActive: true },
      create: {
        email: 'superadmin-os@illurefragrance.com',
        name: 'OS Super Admin',
        passwordHash: pwdHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    superAdminId = admin.id;
    superAdminToken = generateAccessToken({ adminId: admin.id, email: admin.email, role: admin.role });

    // Ensure Test Customer
    const cust = await prisma.customer.upsert({
      where: { email: 'os-customer@test.com' },
      update: { passwordHash: pwdHash, isActive: true },
      create: {
        email: 'os-customer@test.com',
        name: 'OS Test Customer',
        phone: '9988776655',
        passwordHash: pwdHash,
        isActive: true,
      },
    });
    regularCustomerId = cust.id;
  });

  // ==========================================
  // 1. APPLICATION-LEVEL SECRET ENCRYPTION
  // ==========================================
  describe('Application-Level Secret Encryption & Integration Vault', () => {
    it('should encrypt, decrypt, and mask secrets securely with AES-256-GCM', () => {
      const plaintext = 'sk_live_verySecretKey1234567890';
      const encrypted = encryptSecret(plaintext);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toContain(':'); // Format: iv:authTag:ciphertext

      const decrypted = decryptSecret(encrypted);
      expect(decrypted).toBe(plaintext);

      const masked = maskSecret(plaintext);
      expect(masked).toBe('••••••••••••7890');
      expect(masked).not.toContain('sk_live');
    });

    it('should securely save integration credentials and return masked secrets to admin', async () => {
      const res = await request(app)
        .put('/api/admin/integrations/R2')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          isEnabled: true,
          credentials: {
            accessKeyId: 'R2_ACCESS_KEY_XYZ',
            secretAccessKey: 'R2_SECRET_KEY_ABC123456789',
          },
          settings: {
            bucketName: 'illure-os-bucket',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify list endpoint returns masked secrets
      const listRes = await request(app)
        .get('/api/admin/integrations')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(listRes.status).toBe(200);
      const r2 = listRes.body.data.integrations.find((i: any) => i.provider === 'R2');
      expect(r2).toBeDefined();
      expect(r2.hasCredentials).toBe(true);
      expect(r2.maskedCredentials.secretAccessKey).toBe('••••••••••••6789');
      expect(r2.maskedCredentials.secretAccessKey).not.toContain('ABC');
    });

    it('should report CONFIGURATION_REQUIRED when external provider credentials are missing', async () => {
      const res = await request(app)
        .post('/api/admin/integrations/SHIPROCKET/test')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIGURATION_REQUIRED');
      expect(res.body.data.message).toContain('credentials are missing');
    });

    it('should reject R2 upload when R2 storage credentials are not configured', async () => {
      await expect(
        StorageService.upload({
          storageKey: 'catalog/test.jpg',
          buffer: Buffer.from('fake image data'),
          mimeType: 'image/jpeg',
          fileName: 'test.jpg',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        code: 'R2_STORAGE_CONFIGURATION_REQUIRED',
      });
    });

    it('should return isServiceable as null when Shiprocket is unconfigured and no manual pincode rule exists', async () => {
      const res = await ShiprocketService.checkServiceability('999999');
      expect(res.status).toBe('CONFIGURATION_REQUIRED');
      expect(res.isServiceable).toBeNull();
    });

    it('should use manual pincode rule if present when Shiprocket is unconfigured', async () => {
      await prisma.pincodeRule.create({
        data: {
          pincode: '110001',
          isServiceable: true,
          isCodAllowed: true,
          city: 'New Delhi',
          state: 'Delhi',
        },
      });

      const res = await ShiprocketService.checkServiceability('110001');
      expect(res.status).toBe('MANUAL_RULE_ACTIVE');
      expect(res.isServiceable).toBe(true);
      expect(res.city).toBe('New Delhi');
    });

    it('should allow regular ADMIN to view integration status with masked credentials while hiding raw secrets', async () => {
      // Create regular ADMIN
      const pwd = await hashPassword('AdminPass123!');
      const admin = await prisma.adminUser.upsert({
        where: { email: 'staff-admin-view@illurefragrance.com' },
        update: { passwordHash: pwd, role: 'ADMIN', isActive: true },
        create: {
          email: 'staff-admin-view@illurefragrance.com',
          name: 'Staff Admin View',
          passwordHash: pwd,
          role: 'ADMIN',
          isActive: true,
        },
      });
      const staffToken = generateAccessToken({ adminId: admin.id, email: admin.email, role: admin.role });

      const res = await request(app)
        .get('/api/admin/integrations')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const r2 = res.body.data.integrations.find((i: any) => i.provider === 'R2');
      expect(r2).toBeDefined();
      expect(r2.maskedCredentials.status).toBe('CONFIGURED');
      expect(r2.maskedCredentials.secretAccessKey).toBeUndefined();
    });
  });

  // ==========================================
  // 2. PRODUCT DUPLICATION & SLUG REDIRECTS
  // ==========================================
  describe('Product Duplication & Automatic 301 Slug Redirects', () => {
    it('should duplicate product with variants in DRAFT mode and unique SKUs', async () => {
      // Create original product
      const orig = await prisma.product.create({
        data: {
          name: 'Original Oud Wood',
          slug: 'original-oud-wood',
          description: 'Deep woody notes.',
          status: 'ACTIVE',
          variants: {
            create: [
              { sizeLabel: '50 ML', sku: 'OUD-50', price: 2999, stockQuantity: 20 },
              { sizeLabel: '100 ML', sku: 'OUD-100', price: 4999, stockQuantity: 15 },
            ],
          },
        },
      });

      const res = await request(app)
        .post(`/api/admin/products/${orig.id}/duplicate`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const dup = res.body.data.product;

      expect(dup.id).not.toBe(orig.id);
      expect(dup.name).toContain('Original Oud Wood (Copy');
      expect(dup.status).toBe('DRAFT');
      expect(dup.variants.length).toBe(2);
      expect(dup.variants[0].sku).toContain('OUD-50-COPY');
      expect(dup.variants[0].stockQuantity).toBe(0); // Safely reset inventory
    });

    it('should create 301 URL redirect when product slug is updated', async () => {
      const prod = await prisma.product.create({
        data: {
          name: 'Cedar Mist',
          slug: 'cedar-mist',
          description: 'Aromatic cedar fragrance.',
          status: 'ACTIVE',
        },
      });

      // Update slug
      const res = await request(app)
        .patch(`/api/admin/products/${prod.id}`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ slug: 'cedar-mist-noir' });

      expect(res.status).toBe(200);

      // Verify redirect record was automatically created
      const redirect = await prisma.urlRedirect.findUnique({
        where: { sourcePath: '/product/cedar-mist' },
      });
      expect(redirect).toBeDefined();
      expect(redirect?.targetPath).toBe('/product/cedar-mist-noir');
      expect(redirect?.statusCode).toBe(301);
    });
  });

  // ==========================================
  // 3. CONTENT, BANNERS, TICKERS & STATIC PAGES
  // ==========================================
  describe('Content Engine: Banners, Announcement Ticker & Static Pages', () => {
    it('should create and filter active banners with scheduling', async () => {
      const banner = await ContentService.createBanner({
        name: 'Grand Autumn Launch',
        desktopImageUrl: 'https://cdn.illure.com/autumn-banner.webp',
        headline: 'Autumn Whispers',
        isEnabled: true,
      });

      expect(banner.id).toBeDefined();
      expect(banner.headline).toBe('Autumn Whispers');

      const activeBanners = await ContentService.listBanners(true);
      expect(activeBanners.some((b) => b.id === banner.id)).toBe(true);
    });

    it('should manage announcement ticker items', async () => {
      const ticker = await ContentService.createTicker({
        message: 'Complimentary shipping on orders above ₹1,999',
        linkLabel: 'Shop Now',
        linkUrl: '/catalog',
        priority: 1,
        isEnabled: true,
      });

      expect(ticker.id).toBeDefined();
      const list = await ContentService.listTickers(true);
      expect(list.some((t) => t.message.includes('Complimentary shipping'))).toBe(true);
    });

    it('should create and serve static pages by slug', async () => {
      await ContentService.createStaticPage({
        title: 'Artisan Perfumery Story',
        slug: 'artisan-story',
        content: 'Crafted in small batches with genuine perfume oils.',
      });

      const page = await ContentService.getStaticPageBySlug('artisan-story');
      expect(page.title).toBe('Artisan Perfumery Story');
      expect(page.content).toContain('small batches');
    });
  });

  // ==========================================
  // 4. CUSTOMER PASSWORD RESET WORKFLOW
  // ==========================================
  describe('Customer Password Reset Flow & Async Notification', () => {
    it('should generate reset token and enqueue email job', async () => {
      const res = await CustomerAuthService.requestPasswordReset('os-customer@test.com');
      expect(res.message).toContain('reset link has been dispatched');

      // Check customer has token set
      const cust = await prisma.customer.findUnique({
        where: { email: 'os-customer@test.com' },
      });
      expect(cust?.passwordResetToken).toBeDefined();
      expect(cust?.passwordResetExpires).toBeDefined();

      // Check NotificationJob enqueued
      const job = await prisma.notificationJob.findFirst({
        where: { type: 'PASSWORD_RESET' },
      });
      expect(job).toBeDefined();
      expect((job?.payload as any)?.recipient).toBe('os-customer@test.com');
    });
  });

  // ==========================================
  // 5. SHIPROCKET NEUTRAL WEBHOOK
  // ==========================================
  describe('Shipping Carrier Neutral Webhook & Idempotent Processing', () => {
    it('should ingest neutral carrier webhook at /api/webhooks/shipping/receive', async () => {
      const payload = {
        current_status: 'IN_TRANSIT',
        awb: 'SR-AWB-998877',
        courier_name: 'Bluedart Express',
      };

      const res = await request(app)
        .post('/api/webhooks/shipping/receive')
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);

      // Verify webhook log created
      const log = await prisma.webhookLog.findFirst({
        where: { provider: 'SHIPROCKET' },
      });
      expect(log).toBeDefined();
      expect(log?.status).toBe('PROCESSED');
    });
  });

  // ==========================================
  // 6. CLICK TRACKING & TELEMETRY
  // ==========================================
  describe('Click Tracking & Analytics Aggregation', () => {
    it('should record storefront click event and return aggregated metrics', async () => {
      const clickRes = await request(app)
        .post('/api/events/click')
        .send({
          targetType: 'PRODUCT',
          targetId: 'prod-oud-1',
          targetTitle: 'Oud Royale 50ml',
          targetUrl: '/product/oud-royale',
        });

      expect(clickRes.status).toBe(201);
      expect(clickRes.body.success).toBe(true);

      const metricsRes = await request(app)
        .get('/api/admin/analytics/clicks?days=30')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(metricsRes.status).toBe(200);
      expect(metricsRes.body.success).toBe(true);
      expect(metricsRes.body.data.totalClicks).toBeGreaterThanOrEqual(1);
      expect(metricsRes.body.data.clicksByType.PRODUCT).toBeGreaterThanOrEqual(1);
    });
  });
});
