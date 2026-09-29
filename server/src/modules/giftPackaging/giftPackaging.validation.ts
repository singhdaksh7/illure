import { z } from 'zod';

export const createGiftPackagingSchema = z.object({
  name: z.string().min(1, 'Packaging name is required').transform((val) => val.trim()),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than 0'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateGiftPackagingSchema = createGiftPackagingSchema.partial();

export type CreateGiftPackagingInput = z.infer<typeof createGiftPackagingSchema>;
export type UpdateGiftPackagingInput = z.infer<typeof updateGiftPackagingSchema>;
