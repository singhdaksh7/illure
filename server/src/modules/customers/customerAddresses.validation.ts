import { z } from 'zod';

export const addressCreateSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  phone: z.string().min(10, 'Phone is required.'),
  addressLine1: z.string().min(3, 'Address line 1 is required.'),
  addressLine2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State is required.'),
  postalCode: z.string().min(4, 'Postal code is required.').transform((val) => val.trim()),
  isDefault: z.boolean().optional().default(false),
});

export const addressUpdateSchema = addressCreateSchema.partial();
