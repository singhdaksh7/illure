import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('Coupon Validation API', () => {
  let percentageCouponId: string;
  let fixedCouponId: string;
  let expiredCouponId: string;

  beforeAll(async () => {
    const pCoupon = await prisma.coupon.create({
      data: {
        code: 'LUXURY10',
        type: 'PERCENTAGE',
        value: 10,
        minimumOrderAmount: 1000,
        maximumDiscountAmount: 500,
        isActive: true,
      },
    });
    percentageCouponId = pCoupon.id;

    const fCoupon = await prisma.coupon.create({
      data: {
        code: 'WELCOME200',
        type: 'FIXED',
        value: 200,
        minimumOrderAmount: 500,
        isActive: true,
      },
    });
    fixedCouponId = fCoupon.id;

    const eCoupon = await prisma.coupon.create({
      data: {
        code: 'EXPIRED50',
        type: 'PERCENTAGE',
        value: 50,
        expiresAt: new Date(Date.now() - 86400000),
        isActive: true,
      },
    });
    expiredCouponId = eCoupon.id;
  });

  afterAll(async () => {
    await prisma.coupon.deleteMany({
      where: { id: { in: [percentageCouponId, fixedCouponId, expiredCouponId] } },
    });
  });

  it('POST /api/coupons/validate - should validate valid percentage coupon and normalize code', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({
        code: ' luxury10 ',
        subtotal: 2000,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.discountAmount).toBe(200);
  });

  it('POST /api/coupons/validate - should apply max discount cap when percentage exceeds cap', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({
        code: 'LUXURY10',
        subtotal: 10000,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.discountAmount).toBe(500);
  });

  it('POST /api/coupons/validate - should reject when minimum order amount is not met', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({
        code: 'LUXURY10',
        subtotal: 500,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(false);
    expect(res.body.data.reason).toContain('Minimum order amount');
  });

  it('POST /api/coupons/validate - should reject expired coupon', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .send({
        code: 'EXPIRED50',
        subtotal: 2000,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.valid).toBe(false);
    expect(res.body.data.reason).toContain('expired');
  });
});
