import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required.').transform((val) => val.trim().toUpperCase()),
  subtotal: z.number().min(0, 'Subtotal must be a non-negative number.'),
});
