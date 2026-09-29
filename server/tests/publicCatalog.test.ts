import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Public Customer Catalog API', () => {
  let sampleSlug: string;

  beforeAll(async () => {
    const activeProduct = await prisma.product.findFirst({
      where: { status: 'ACTIVE' },
      select: { slug: true },
    });
    if (activeProduct) {
      sampleSlug = activeProduct.slug;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/products - should list active products for customer catalog', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);

    if (res.body.data.items.length > 0) {
      const item = res.body.data.items[0];
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.minPrice).toBeTypeOf('number');

      // Verify costPrice is NOT exposed publicly
      if (item.variants && item.variants.length > 0) {
        expect(item.variants[0].costPrice).toBeUndefined();
      }
    }
  });

  it('GET /api/products - should filter by gender', async () => {
    const res = await request(app).get('/api/products?gender=MEN');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('GET /api/products - should search by keyword', async () => {
    const res = await request(app).get('/api/products?search=Aqua');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('GET /api/products/:slug - should return detailed product info for active product', async () => {
    if (!sampleSlug) return;

    const res = await request(app).get(`/api/products/${sampleSlug}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.slug).toBe(sampleSlug);
    expect(res.body.data.product.inStock).toBeDefined();

    // Verify sensitive admin cost price is omitted
    expect(res.body.data.product.variants[0].costPrice).toBeUndefined();
  });
});
