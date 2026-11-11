import crypto from 'crypto';
import { prisma } from '../../utils/prisma.js';
import { LoyaltyTxType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service.js';

export class LoyaltyService {
  /**
   * Get or create loyalty account for customer.
   */
  static async getOrCreateAccount(customerId: string) {
    let account = await prisma.loyaltyAccount.findUnique({
      where: { customerId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: {
          customerId,
          balance: 100, // Welcome bonus 100 points
          tier: 'BRONZE',
          transactions: {
            create: {
              type: LoyaltyTxType.EARN,
              points: 100,
              reason: 'Welcome into House of İLLURÊ',
            },
          },
        },
        include: {
          transactions: true,
        },
      });
    }

    return account;
  }

  /**
   * Award points on completed order (1 point per ₹10 spent).
   */
  static async awardPointsForOrder(customerId: string, orderId: string, orderAmount: number) {
    const pointsToEarn = Math.floor(orderAmount / 10);
    if (pointsToEarn <= 0) return null;

    return prisma.$transaction(async (tx) => {
      let account = await tx.loyaltyAccount.findUnique({ where: { customerId } });
      if (!account) {
        account = await tx.loyaltyAccount.create({
          data: { customerId, balance: 0, tier: 'BRONZE' },
        });
      }

      const newBalance = account.balance + pointsToEarn;
      let newTier = account.tier;
      if (newBalance >= 5000) newTier = 'OBSIDIAN';
      else if (newBalance >= 2000) newTier = 'GOLD';
      else if (newBalance >= 500) newTier = 'SILVER';

      await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: LoyaltyTxType.EARN,
          points: pointsToEarn,
          orderId,
          reason: `Earned on order ${orderId}`,
        },
      });

      return tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balance: newBalance,
          tier: newTier,
        },
      });
    });
  }

  /**
   * Redeem points at checkout (1 point = ₹1 discount, min 100 points).
   */
  static async redeemPoints(customerId: string, pointsToRedeem: number, orderId?: string) {
    if (pointsToRedeem < 100) {
      throw { statusCode: 400, code: 'MIN_POINTS_REQUIRED', message: 'Minimum 100 points required to redeem.' };
    }

    return prisma.$transaction(async (tx) => {
      const account = await tx.loyaltyAccount.findUnique({ where: { customerId } });
      if (!account || account.balance < pointsToRedeem) {
        throw { statusCode: 400, code: 'INSUFFICIENT_POINTS', message: 'Insufficient loyalty balance.' };
      }

      await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: LoyaltyTxType.REDEEM,
          points: -pointsToRedeem,
          orderId: orderId || null,
          reason: `Redeemed points at checkout`,
        },
      });

      const updated = await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: { balance: account.balance - pointsToRedeem },
      });

      return {
        redeemedPoints: pointsToRedeem,
        discountInr: pointsToRedeem,
        remainingBalance: updated.balance,
      };
    });
  }

  /**
   * Get or generate referral code for customer.
   */
  static async getReferralCode(customerId: string) {
    let referral = await prisma.referral.findFirst({
      where: { referrerId: customerId },
    });

    if (!referral) {
      const code = `ILR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      referral = await prisma.referral.create({
        data: {
          referrerId: customerId,
          code,
        },
      });
    }

    return referral;
  }

  /**
   * Abandoned cart scanner: Find unpurchased carts created > 2 hours ago with active customer.
   */
  static async scanAbandonedCarts() {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const carts = await prisma.cart.findMany({
      where: {
        updatedAt: { gte: fortyEightHoursAgo, lte: twoHoursAgo },
        items: { some: {} },
        customer: { email: { not: null } },
      },
      include: {
        customer: true,
        items: true,
      },
      take: 25,
    });

    let enqueued = 0;
    for (const c of carts) {
      if (c.customer?.email) {
        await NotificationsService.enqueue({
          type: 'ABANDONED_CART',
          payload: {
            to: c.customer.email,
            customerName: c.customer.name,
            itemCount: c.items.length,
            recoveryUrl: '/cart',
          },
        });
        enqueued++;
      }
    }

    return { scanned: carts.length, enqueued };
  }

  /**
   * Limited Drops listing.
   */
  static async getActiveDrops() {
    return prisma.limitedDrop.findMany({
      where: { isActive: true },
      orderBy: { startsAt: 'asc' },
    });
  }
}
