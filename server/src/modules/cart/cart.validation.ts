import { z } from 'zod';

export const cartItemAddSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID.'),
  quantity: z.number().int().positive('Quantity must be at least 1.').default(1),
  giftPackagingId: z.string().uuid('Invalid gift packaging ID.').optional().nullable(),
  giftMessage: z.string().max(250, 'Gift message cannot exceed 250 characters.').optional().nullable(),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().positive('Quantity must be at least 1.').optional(),
  giftPackagingId: z.string().uuid('Invalid gift packaging ID.').optional().nullable(),
  giftMessage: z.string().max(250, 'Gift message cannot exceed 250 characters.').optional().nullable(),
});

export const mergeCartSchema = z.object({
  sessionKey: z.string().min(1, 'Session key is required.'),
});
