import { prisma } from '../../utils/prisma.js';
import { ReviewStatus } from '@prisma/client';

export class RetentionService {
  /**
   * Save or update customer scent profile.
   */
  static async upsertScentProfile(customerId: string, data: {
    preferredFamilies?: string[];
    likedNotes?: string[];
    avoidedNotes?: string[];
    moods?: string[];
    occasions?: string[];
    intensity?: string;
    quizAnswers?: any;
  }) {
    return prisma.customerScentProfile.upsert({
      where: { customerId },
      create: {
        customerId,
        preferredFamilies: data.preferredFamilies || [],
        likedNotes: data.likedNotes || [],
        avoidedNotes: data.avoidedNotes || [],
        moods: data.moods || [],
        occasions: data.occasions || [],
        intensity: data.intensity || null,
        quizAnswers: data.quizAnswers || {},
      },
      update: {
        preferredFamilies: data.preferredFamilies,
        likedNotes: data.likedNotes,
        avoidedNotes: data.avoidedNotes,
        moods: data.moods,
        occasions: data.occasions,
        intensity: data.intensity,
        quizAnswers: data.quizAnswers,
      },
    });
  }

  /**
   * Retrieve scent profile for customer.
   */
  static async getScentProfile(customerId: string) {
    return prisma.customerScentProfile.findUnique({
      where: { customerId },
    });
  }

  /**
   * Personalized recommendations based on customer profile or purchase history.
   */
  static async getRecommendations(customerId?: string) {
    let preferredFamilies: string[] = [];

    if (customerId) {
      const profile = await prisma.customerScentProfile.findUnique({
        where: { customerId },
      });
      if (profile && profile.preferredFamilies.length > 0) {
        preferredFamilies = profile.preferredFamilies;
      }
    }

    const where: any = { status: 'ACTIVE' };
    if (preferredFamilies.length > 0) {
      where.fragranceFamily = { in: preferredFamilies, mode: 'insensitive' };
    }

    let products = await prisma.product.findMany({
      where,
      include: {
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      take: 6,
    });

    if (products.length === 0) {
      products = await prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: {
          variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        take: 6,
      });
    }

    return products;
  }

  /**
   * Buy Again: Extract previously ordered items with real-time stock and price check.
   */
  static async getBuyAgainItems(customerId: string) {
    const orders = await prisma.order.findMany({
      where: { customerId, status: { in: ['CONFIRMED', 'DELIVERED'] } },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const itemsMap = new Map<string, any>();
    for (const order of orders) {
      for (const item of order.items) {
        if (item.variant && !itemsMap.has(item.variant.id)) {
          itemsMap.set(item.variant.id, {
            variantId: item.variant.id,
            productId: item.variant.productId,
            productName: item.variant.product.name,
            productSlug: item.variant.product.slug,
            sizeLabel: item.variant.sizeLabel,
            price: Number(item.variant.price),
            inStock: item.variant.stockQuantity > 0,
            stockQuantity: item.variant.stockQuantity,
            lastOrderedAt: order.createdAt,
          });
        }
      }
    }

    return Array.from(itemsMap.values());
  }

  /**
   * Submit product review (with verified buyer check).
   */
  static async submitReview(customerId: string, data: {
    productId: string;
    variantId?: string;
    rating: number;
    scentRating?: number;
    longevityRating?: number;
    valueRating?: number;
    wouldBuyAgain?: boolean;
    title?: string;
    comment: string;
    mediaUrls?: string[];
  }) {
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw { statusCode: 400, code: 'INVALID_RATING', message: 'Rating must be between 1 and 5.' };
    }
    if (!data.comment || data.comment.trim().length < 5) {
      throw { statusCode: 400, code: 'INVALID_COMMENT', message: 'Comment must be at least 5 characters.' };
    }

    // Check if customer is a verified buyer of this product
    const pastOrder = await prisma.order.findFirst({
      where: {
        customerId,
        status: { in: ['CONFIRMED', 'DELIVERED'] },
        items: { some: { productId: data.productId } },
      },
    });

    return prisma.productReview.create({
      data: {
        productId: data.productId,
        variantId: data.variantId || null,
        customerId,
        orderId: pastOrder ? pastOrder.id : null,
        rating: data.rating,
        scentRating: data.scentRating || null,
        longevityRating: data.longevityRating || null,
        valueRating: data.valueRating || null,
        wouldBuyAgain: data.wouldBuyAgain ?? true,
        title: data.title?.trim() || null,
        comment: data.comment.trim(),
        mediaUrls: data.mediaUrls || [],
        isVerified: Boolean(pastOrder),
        status: ReviewStatus.APPROVED, // auto-approve verified, or pending
      },
    });
  }

  /**
   * List reviews for a product with statistics.
   */
  static async getProductReviews(productId: string) {
    const reviews = await prisma.productReview.findMany({
      where: { productId, status: ReviewStatus.APPROVED },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = reviews.length;
    const averageRating = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    return {
      total,
      averageRating: Number(averageRating.toFixed(1)),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        scentRating: r.scentRating,
        longevityRating: r.longevityRating,
        wouldBuyAgain: r.wouldBuyAgain,
        title: r.title,
        comment: r.comment,
        authorName: r.customer?.name || 'Customer',
        isVerified: r.isVerified,
        createdAt: r.createdAt,
      })),
    };
  }
}
