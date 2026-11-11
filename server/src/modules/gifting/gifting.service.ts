import crypto from 'crypto';
import { prisma } from '../../utils/prisma.js';
import { GiftCardStatus, FeatureStatus } from '@prisma/client';
import { FeaturesService } from '../features/features.service.js';

export class GiftingService {
  /**
   * Generate an uppercase cryptographic 16-character alphanumeric code.
   */
  static generateGiftCardCode(): string {
    const raw = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `ILR-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  }

  /**
   * Create / purchase a gift card.
   */
  static async issueGiftCard(data: {
    amount: number;
    recipientEmail?: string;
    recipientName?: string;
    senderName?: string;
    message?: string;
    purchasedByCustomerId?: string;
    expiresInDays?: number;
  }) {
    if (data.amount <= 0 || data.amount > 100000) {
      throw { statusCode: 400, code: 'INVALID_AMOUNT', message: 'Gift card amount must be between ₹1 and ₹1,00,000.' };
    }

    // Check if gift_cards feature is active
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'gift_cards' },
    });
    if (feature && (!feature.isEnabled || feature.status !== FeatureStatus.ACTIVE)) {
      throw { statusCode: 400, code: 'FEATURE_DISABLED', message: 'Gift card purchases are currently disabled by administration.' };
    }

    const code = this.generateGiftCardCode();
    // Expiry only if explicitly configured; no invented default expiry
    const config = (feature?.config as Record<string, any>) || {};
    const defaultDays = config.expiryDays || null;
    const days = data.expiresInDays !== undefined ? data.expiresInDays : defaultDays;

    const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;

    const giftCard = await prisma.giftCard.create({
      data: {
        code,
        initialBalance: data.amount,
        currentBalance: data.amount,
        currency: 'INR',
        status: GiftCardStatus.ACTIVE,
        recipientEmail: data.recipientEmail?.trim().toLowerCase() || null,
        recipientName: data.recipientName?.trim() || null,
        senderName: data.senderName?.trim() || null,
        message: data.message?.trim() || null,
        purchasedByCustomerId: data.purchasedByCustomerId || null,
        expiresAt,
      },
    });

    return giftCard;
  }

  /**
   * Verify and check balance of a gift card.
   * Minimal safe disclosure: does NOT leak recipient email, sender info, or audit history publicly.
   */
  static async checkBalance(code: string) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 8) {
      throw { statusCode: 400, code: 'INVALID_CODE', message: 'Invalid gift card code format.' };
    }

    const card = await prisma.giftCard.findUnique({
      where: { code: cleanCode },
    });

    if (!card) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Invalid gift card code.' };
    }

    if (card.status !== GiftCardStatus.ACTIVE) {
      throw { statusCode: 400, code: 'CARD_INACTIVE', message: `Gift card is ${card.status.toLowerCase()}.` };
    }

    if (card.expiresAt && card.expiresAt < new Date()) {
      throw { statusCode: 400, code: 'CARD_EXPIRED', message: 'This gift card has expired.' };
    }

    return {
      code: card.code,
      currency: card.currency,
      currentBalance: Number(card.currentBalance),
      expiresAt: card.expiresAt,
      status: card.status,
    };
  }

  /**
   * Redeem or partially deduct balance from a gift card.
   * Concurrency safe and prevents negative balance using row-level select for update.
   */
  static async redeem(code: string, amountToDeduct: number) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Gift card code is required.' };
    }
    if (amountToDeduct <= 0) {
      throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Amount to deduct must be greater than zero.' };
    }

    return prisma.$transaction(async (tx) => {
      // Row lock to prevent concurrent double-spend race condition
      const lockedCards = await tx.$queryRaw<Array<any>>`
        SELECT * FROM gift_cards WHERE code = ${cleanCode} FOR UPDATE
      `;
      const card = lockedCards[0];

      if (!card || card.status !== GiftCardStatus.ACTIVE) {
        throw { statusCode: 400, code: 'CARD_UNAVAILABLE', message: 'Gift card is not available for redemption.' };
      }

      if (card.expiresAt && new Date(card.expiresAt) < new Date()) {
        throw { statusCode: 400, code: 'CARD_EXPIRED', message: 'This gift card has expired.' };
      }

      const current = Number(card.currentBalance);
      if (current <= 0) {
        throw { statusCode: 400, code: 'NO_BALANCE', message: 'Gift card balance is depleted.' };
      }

      const deducted = Math.min(current, amountToDeduct);
      const remaining = current - deducted;
      const isDepleted = remaining <= 0;

      const updated = await tx.giftCard.update({
        where: { id: card.id },
        data: {
          currentBalance: remaining,
          status: isDepleted ? GiftCardStatus.REDEEMED : GiftCardStatus.ACTIVE,
          redeemedAt: isDepleted ? new Date() : card.redeemedAt,
        },
      });

      return {
        code: updated.code,
        amountDeducted: deducted,
        remainingBalance: Number(updated.currentBalance),
        status: updated.status,
      };
    });
  }

  /**
   * Check eligibility for free samples based on admin configuration.
   * Never hardcodes 1999 or 3ml; reads configuration or returns CONFIGURATION REQUIRED.
   */
  static async getFreeSamplesEligibility(subtotal: number) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'free_samples' },
    });

    const isEnabled = feature?.isEnabled && feature.status === FeatureStatus.ACTIVE;
    const config = (feature?.config as Record<string, any>) || {};

    const minSpend = config.minSpend ?? (feature?.minimumOrderValue ? Number(feature.minimumOrderValue) : null);
    const eligibleVariantIds: string[] = config.eligibleVariantIds || [];
    const maxSamples = config.maxSamplesPerOrder || 0;

    // If no eligible variants or no minSpend configured, feature requires configuration
    if (!isEnabled || minSpend === null || eligibleVariantIds.length === 0 || maxSamples === 0) {
      return {
        status: FeatureStatus.CONFIGURATION_REQUIRED,
        eligible: false,
        message: 'Free sample program is currently undergoing configuration by administration.',
        minSpend: minSpend || 0,
        allowedCount: 0,
        availableSamples: [],
      };
    }

    // Query real ProductVariants from database
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: eligibleVariantIds },
        isActive: true,
        stockQuantity: { gt: 0 },
      },
      include: {
        product: { select: { id: true, name: true, fragranceFamily: true, slug: true } },
      },
    });

    const isEligible = subtotal >= minSpend;

    return {
      status: FeatureStatus.ACTIVE,
      eligible: isEligible,
      minSpend,
      allowedCount: isEligible ? Math.min(maxSamples, variants.length) : 0,
      availableSamples: variants.map((v) => ({
        variantId: v.id,
        productId: v.productId,
        name: `${v.product.name} (${v.sizeLabel})`,
        size: v.sizeLabel,
        family: v.product.fragranceFamily || 'Collection',
        stockQuantity: v.stockQuantity,
      })),
    };
  }

  /**
   * Unified Gift Finder reusing the standard Scent Finder taxonomy and live catalog.
   */
  static async findGift(params: { recipient?: string; budget?: number; vibe?: string }) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'gift_finder' },
    });

    if (feature && (!feature.isEnabled || feature.status !== FeatureStatus.ACTIVE)) {
      return {
        status: FeatureStatus.CONFIGURATION_REQUIRED,
        recommendations: [],
      };
    }

    const where: any = { status: 'ACTIVE' };
    if (params.vibe) {
      where.fragranceFamily = { contains: params.vibe, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          where: {
            isActive: true,
            ...(params.budget ? { price: { lte: params.budget } } : {}),
          },
          orderBy: { price: 'asc' },
        },
      },
      take: 6,
    });

    return {
      status: FeatureStatus.ACTIVE,
      recommendations: products
        .filter((p) => p.variants.length > 0)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          family: p.fragranceFamily,
          startingPrice: Number(p.variants[0].price),
        })),
    };
  }
}
