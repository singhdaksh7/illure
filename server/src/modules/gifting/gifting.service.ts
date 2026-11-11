import crypto from 'crypto';
import { prisma } from '../../utils/prisma.js';
import { GiftCardStatus } from '@prisma/client';

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

    const code = this.generateGiftCardCode();
    const expiresAt = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // default 1 year

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
   */
  static async checkBalance(code: string) {
    const cleanCode = (code || '').trim().toUpperCase();
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
      senderName: card.senderName,
      recipientName: card.recipientName,
    };
  }

  /**
   * Redeem or partially deduct balance from a gift card.
   */
  static async redeem(code: string, amountToDeduct: number) {
    const cleanCode = (code || '').trim().toUpperCase();

    return prisma.$transaction(async (tx) => {
      const card = await tx.giftCard.findUnique({
        where: { code: cleanCode },
      });

      if (!card || card.status !== GiftCardStatus.ACTIVE) {
        throw { statusCode: 400, code: 'CARD_UNAVAILABLE', message: 'Gift card is not available for redemption.' };
      }

      if (card.expiresAt && card.expiresAt < new Date()) {
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
   * Check eligibility for free samples on cart/order value.
   */
  static getFreeSamplesEligibility(subtotal: number) {
    const isEligible = subtotal >= 1999;
    return {
      eligible: isEligible,
      minSpend: 1999,
      allowedCount: isEligible ? 2 : 0,
      availableSamples: [
        { id: 'sample-velvet-oud', name: 'Velvet Oud (3ml Sample)', family: 'Woody' },
        { id: 'sample-noir-leather', name: 'Noir Leather (3ml Sample)', family: 'Amber' },
        { id: 'sample-santal-blanc', name: 'Santal Blanc (3ml Sample)', family: 'Woody' },
      ],
    };
  }

  /**
   * Gift finder suggestion engine.
   */
  static async findGift(params: { recipient?: string; budget?: number; vibe?: string }) {
    const where: any = { status: 'ACTIVE' };
    if (params.vibe) {
      where.fragranceFamily = { contains: params.vibe, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      include: { variants: { where: { isActive: true }, orderBy: { price: 'asc' } } },
      take: 6,
    });

    return {
      recommendations: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        family: p.fragranceFamily,
        startingPrice: p.variants[0]?.price ? Number(p.variants[0].price) : 2490,
      })),
    };
  }
}
