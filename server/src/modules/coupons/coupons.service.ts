import { prisma } from '../../utils/prisma.js';

export class CouponService {
  static async validateCoupon(code: string, subtotal: number) {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      return { valid: false, reason: 'Invalid coupon code.' };
    }

    if (!coupon.isActive) {
      return { valid: false, reason: 'This coupon is no longer active.' };
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      return { valid: false, reason: 'This coupon promotion has not started yet.' };
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      return { valid: false, reason: 'This coupon has expired.' };
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, reason: 'This coupon usage limit has been reached.' };
    }

    const minAmount = coupon.minimumOrderAmount ? Number(coupon.minimumOrderAmount) : 0;
    if (subtotal < minAmount) {
      return {
        valid: false,
        reason: `Minimum order amount of ₹${minAmount} required for this coupon.`,
      };
    }

    let discountAmount = 0;
    const value = Number(coupon.value);
    const maxDiscount = coupon.maximumDiscountAmount ? Number(coupon.maximumDiscountAmount) : null;

    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (subtotal * value) / 100;
      if (maxDiscount !== null && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else {
      discountAmount = Math.min(value, subtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      discountAmount,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value,
        minimumOrderAmount: minAmount,
        maximumDiscountAmount: maxDiscount,
      },
    };
  }
}
