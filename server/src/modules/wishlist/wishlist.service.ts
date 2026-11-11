import { prisma } from '../../utils/prisma.js';

export class WishlistService {
  static async getWishlist(customerId: string) {
    const items = await prisma.wishlistItem.findMany({
      where: { customerId },
      include: {
        product: {
          include: {
            images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            variants: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                sizeLabel: true,
                sku: true,
                price: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => {
      const prices = item.product.variants.map((v) => Number(v.price));
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const inStock = item.product.variants.some((v) => v.stockQuantity > 0);

      return {
        id: item.id,
        productId: item.productId,
        createdAt: item.createdAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          inspiredByName: item.product.inspiredByName,
          fragranceFamily: item.product.fragranceFamily,
          primaryImage: item.product.images.find((img) => img.isPrimary) || item.product.images[0] || null,
          minPrice,
          inStock,
          variants: item.product.variants.map((v) => ({
            ...v,
            price: Number(v.price),
            inStock: v.stockQuantity > 0,
          })),
        },
      };
    });
  }

  static async addItem(customerId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 'ACTIVE') {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Product not found or currently unavailable.' };
    }

    const item = await prisma.wishlistItem.upsert({
      where: {
        customerId_productId: { customerId, productId },
      },
      create: { customerId, productId },
      update: {},
    });

    return item;
  }

  static async removeItem(customerId: string, productId: string) {
    await prisma.wishlistItem.deleteMany({
      where: { customerId, productId },
    });

    return { success: true };
  }

  static async mergeGuestWishlist(customerId: string, productIds: string[]) {
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return this.getWishlist(customerId);
    }

    // Verify which product IDs actually exist and are ACTIVE
    const validProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    const validIds = validProducts.map((p) => p.id);

    // Upsert items idempotently
    for (const pid of validIds) {
      await prisma.wishlistItem.upsert({
        where: {
          customerId_productId: { customerId, productId: pid },
        },
        create: { customerId, productId: pid },
        update: {},
      });
    }

    return this.getWishlist(customerId);
  }
}
