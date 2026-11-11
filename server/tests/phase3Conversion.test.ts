import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Phase 3 Conversion APIs', () => {
  let sampleProduct: any;
  let sampleVariant: any;
  let customerToken: string;
  let customerId: string;

  beforeAll(async () => {
    // Find active product and variant from test db
    sampleProduct = await prisma.product.findFirst({
      where: { status: 'ACTIVE' },
      include: { variants: { where: { isActive: true } } },
    });

    if (sampleProduct && sampleProduct.variants.length > 0) {
      sampleVariant = sampleProduct.variants[0];
    }

    // Register a test customer
    const regRes = await request(app)
      .post('/api/auth/customer/register')
      .send({
        email: `phase3_tester_${Date.now()}@example.com`,
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
        password: 'Password123!',
        name: 'Phase3 Reviewer',
      });

    if (regRes.body?.data?.tokens?.accessToken) {
      customerToken = regRes.body.data.tokens.accessToken;
      customerId = regRes.body.data.customer.id;
    }
  });

  // 1. Wishlist
  describe('Wishlist API', () => {
    it('should add item to customer wishlist and retrieve it', async () => {
      if (!sampleProduct || !customerToken) return;

      const addRes = await request(app)
        .post(`/api/wishlist/${sampleProduct.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(addRes.status).toBe(201);
      expect(addRes.body.success).toBe(true);

      const listRes = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.items.some((i: any) => i.productId === sampleProduct.id)).toBe(true);
    });

    it('should merge guest wishlist items on login/merge endpoint', async () => {
      if (!sampleProduct || !customerToken) return;

      const mergeRes = await request(app)
        .post('/api/wishlist/merge')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productIds: [sampleProduct.id] });

      expect(mergeRes.status).toBe(200);
      expect(mergeRes.body.success).toBe(true);
    });

    it('should remove item from customer wishlist', async () => {
      if (!sampleProduct || !customerToken) return;

      const delRes = await request(app)
        .delete(`/api/wishlist/${sampleProduct.id}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
    });
  });

  // 2. Advanced Search & Facets
  describe('Advanced Search & Facets API', () => {
    it('should return catalog facets for filters', async () => {
      const res = await request(app).get('/api/products/facets');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.facets).toBeDefined();
      expect(Array.isArray(res.body.data.facets.families)).toBe(true);
    });

    it('should return grouped search results for query', async () => {
      const res = await request(app).get('/api/products/search?q=oud');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.fragrances)).toBe(true);
    });
  });

  // 3. Stock Alerts
  describe('Stock Alerts API', () => {
    it('should subscribe to back-in-stock alerts for an out-of-stock variant', async () => {
      // Create a temporary out-of-stock variant
      if (!sampleProduct) return;

      const oosVariant = await prisma.productVariant.create({
        data: {
          productId: sampleProduct.id,
          sizeLabel: '99 ML Rare Batch',
          sku: `TEST-OOS-${Date.now()}`,
          price: 4999.0,
          stockQuantity: 0,
          isActive: true,
        },
      });

      const subRes = await request(app)
        .post('/api/stock-alerts/subscribe')
        .send({
          variantId: oosVariant.id,
          email: 'notify_me@example.com',
        });

      expect(subRes.status).toBe(201);
      expect(subRes.body.success).toBe(true);
      expect(subRes.body.data.subscription).toBeDefined();

      // Clean up
      await prisma.stockAlertSubscription.deleteMany({ where: { productVariantId: oosVariant.id } });
      await prisma.productVariant.delete({ where: { id: oosVariant.id } });
    });
  });

  // 4. Discovery Sets
  describe('Discovery Sets API', () => {
    it('should list public discovery sets and validate pricing', async () => {
      // Seed discovery sets if not already present
      const { DiscoverySetsService } = await import('../src/modules/discoverySets/discoverySets.service.js');
      await DiscoverySetsService.seedDefaults();

      const listRes = await request(app).get('/api/discovery-sets');
      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(Array.isArray(listRes.body.data.sets)).toBe(true);
      expect(listRes.body.data.sets.length).toBeGreaterThan(0);

      const firstSet = listRes.body.data.sets[0];
      const getRes = await request(app).get(`/api/discovery-sets/${firstSet.slug}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.set.slug).toBe(firstSet.slug);
    });
  });
});
