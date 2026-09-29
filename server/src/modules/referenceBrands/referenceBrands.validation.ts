import { z } from 'zod';

export const createReferenceBrandSchema = z.object({
  name: z.string().min(1, 'Reference brand name is required').transform((val) => val.trim()),
  slug: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toLowerCase() : undefined)),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateReferenceBrandSchema = createReferenceBrandSchema.partial();

export type CreateReferenceBrandInput = z.infer<typeof createReferenceBrandSchema>;
export type UpdateReferenceBrandInput = z.infer<typeof updateReferenceBrandSchema>;
