import { z } from 'zod';
import { InventoryMovementType } from '@prisma/client';

export const adjustStockSchema = z.object({
  quantityDelta: z.number().int('Quantity delta must be an integer').refine((val) => val !== 0, {
    message: 'Quantity delta cannot be zero',
  }),
  reason: z.string().min(1, 'A reason for stock adjustment is required').transform((val) => val.trim()),
  reference: z.string().optional(),
  movementType: z
    .nativeEnum(InventoryMovementType)
    .default(InventoryMovementType.ADJUSTMENT),
});

export const inventoryMovementsFilterSchema = z.object({
  variantId: z.string().optional(),
  productId: z.string().optional(),
  type: z.nativeEnum(InventoryMovementType).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type InventoryMovementsFilterInput = z.infer<typeof inventoryMovementsFilterSchema>;
