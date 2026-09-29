import { prisma } from '../../utils/prisma.js';
import { AdjustStockInput, InventoryMovementsFilterInput } from './inventory.validation.js';
import { InventoryMovementType } from '@prisma/client';

export class InventoryService {
  static async adjustStock(
    variantId: string,
    input: AdjustStockInput,
    createdByAdminId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: { product: { select: { id: true, name: true } } },
      });

      if (!variant) {
        throw { statusCode: 404, code: 'VARIANT_NOT_FOUND', message: 'Product variant not found.' };
      }

      const newStockQuantity = variant.stockQuantity + input.quantityDelta;

      if (newStockQuantity < 0) {
        throw {
          statusCode: 400,
          code: 'INSUFFICIENT_STOCK',
          message: `Stock adjustment would result in negative stock (${newStockQuantity}). Current stock is ${variant.stockQuantity}.`,
        };
      }

      // Determine movement type if delta sign implies purchase/sale/adjustment
      let type: InventoryMovementType = input.movementType || InventoryMovementType.ADJUSTMENT;
      if (!input.movementType) {
        type = input.quantityDelta > 0 ? InventoryMovementType.PURCHASE : InventoryMovementType.ADJUSTMENT;
      }

      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: newStockQuantity },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          variantId,
          type,
          quantity: input.quantityDelta,
          reason: input.reason,
          reference: input.reference,
          createdByAdminId,
        },
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              sizeLabel: true,
              product: { select: { id: true, name: true } },
            },
          },
          createdByAdmin: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return { variant: updatedVariant, movement };
    });
  }

  static async getMovements(filters: InventoryMovementsFilterInput) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.variantId) where.variantId = filters.variantId;
    if (filters.productId) where.variant = { productId: filters.productId };
    if (filters.type) where.type = filters.type;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [items, total] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              sizeLabel: true,
              stockQuantity: true,
              product: { select: { id: true, name: true, slug: true } },
            },
          },
          createdByAdmin: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  static async getLowStockVariants() {
    // Find all variants where stockQuantity <= lowStockThreshold and isActive = true
    const variants = await prisma.productVariant.findMany({
      where: {
        isActive: true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    // Filter in JS or SQL for stockQuantity <= lowStockThreshold
    const lowStock = variants.filter((v) => v.stockQuantity <= v.lowStockThreshold);

    return lowStock;
  }
}
