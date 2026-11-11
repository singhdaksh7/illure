import crypto from 'crypto';
import { prisma } from '../../utils/prisma.js';
import { LoyaltyTxType, FeatureStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service.js';

export class LoyaltyService {
  /**
   * Get or create loyalty account for customer.
   * If loyalty is not active, returns status CONFIGURATION_REQUIRED.
   */
  static async getOrCreateAccount(customerId: string) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'loyalty' },
    });

    const isEnabled = feature?.isEnabled && feature.status === FeatureStatus.ACTIVE;
    const config = (feature?.config as Record<string, any>) || {};
    const signupPoints = config.signupPoints || 0;

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
          balance: isEnabled ? signupPoints : 0,
          tier: 'MEMBER',
          transactions: isEnabled && signupPoints > 0 ? {
            create: {
              type: LoyaltyTxType.EARN,
              points: signupPoints,
              reason: 'Welcome into House of İLLURÊ',
            },
          } : undefined,
        },
        include: {
          transactions: true,
        },
      });
    }

    return {
      status: isEnabled ? FeatureStatus.ACTIVE : FeatureStatus.CONFIGURATION_REQUIRED,
      account,
    };
  }

  /**
   * Award points on completed order with idempotency protection.
   */
  static async awardPointsForOrder(customerId: string, orderId: string, orderAmount: number) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'loyalty' },
    });

    if (!feature || !feature.isEnabled || feature.status !== FeatureStatus.ACTIVE) {
      return null;
    }

    const config = (feature.config as Record<string, any>) || {};
    const earnRatePerInr = config.earnRatePerInr || 0.1; // e.g. 1 pt per ₹10
    const pointsToEarn = Math.floor(orderAmount * earnRatePerInr);
    if (pointsToEarn <= 0) return null;

    // Check idempotency: check if points for this order have already been awarded
    const existingTx = await prisma.loyaltyTransaction.findFirst({
      where: { orderId, type: LoyaltyTxType.EARN },
    });
    if (existingTx) {
      return null; // Already awarded
    }

    return prisma.$transaction(async (tx) => {
      let account = await tx.loyaltyAccount.findUnique({ where: { customerId } });
      if (!account) {
        account = await tx.loyaltyAccount.create({
          data: { customerId, balance: 0, tier: 'MEMBER' },
        });
      }

      const newBalance = account.balance + pointsToEarn;
      
      // Dynamic tier thresholds from config
      const tiersConfig = config.tiers || { SILVER: 500, GOLD: 2000, OBSIDIAN: 5000 };
      let newTier = 'MEMBER';
      if (tiersConfig.OBSIDIAN && newBalance >= tiersConfig.OBSIDIAN) newTier = 'OBSIDIAN';
      else if (tiersConfig.GOLD && newBalance >= tiersConfig.GOLD) newTier = 'GOLD';
      else if (tiersConfig.SILVER && newBalance >= tiersConfig.SILVER) newTier = 'SILVER';

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
   * Redeem points at checkout with concurrency protection.
   */
  static async redeemPoints(customerId: string, pointsToRedeem: number, orderId?: string) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'loyalty' },
    });

    if (!feature || !feature.isEnabled || feature.status !== FeatureStatus.ACTIVE) {
      throw { statusCode: 400, code: 'FEATURE_DISABLED', message: 'Loyalty redemption is currently not active.' };
    }

    const config = (feature.config as Record<string, any>) || {};
    const minRedemption = config.minRedemption || 100;
    const pointValueInr = config.pointValueInr || 1.0;

    if (pointsToRedeem < minRedemption) {
      throw { statusCode: 400, code: 'MIN_POINTS_REQUIRED', message: `Minimum ${minRedemption} points required to redeem.` };
    }

    return prisma.$transaction(async (tx) => {
      // Row lock customer loyalty account to prevent race conditions
      const accounts = await tx.$queryRaw<Array<any>>`
        SELECT * FROM loyalty_accounts WHERE "customerId" = ${customerId} FOR UPDATE
      `;
      const account = accounts[0];

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
        discountInr: Math.round(pointsToRedeem * pointValueInr),
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
   * Attribute and process referral reward idempotently.
   */
  static async processReferralOrder(referralCode: string, newCustomerId: string, orderId: string, orderAmount: number) {
    const cleanCode = (referralCode || '').trim().toUpperCase();
    const referral = await prisma.referral.findUnique({
      where: { code: cleanCode },
    });

    if (!referral) return null;
    if (referral.referrerId === newCustomerId) {
      // Prevent self-referral
      return { success: false, reason: 'SELF_REFERRAL_DISALLOWED' };
    }

    // Check if referral reward already claimed
    if (referral.rewardClaimed) {
      return { success: false, reason: 'REWARD_ALREADY_CLAIMED' };
    }

    return prisma.$transaction(async (tx) => {
      await tx.referral.update({
        where: { id: referral.id },
        data: {
          referredId: newCustomerId,
          rewardClaimed: true,
        },
      });

      // Award points or reward to referrer
      let referrerAccount = await tx.loyaltyAccount.findUnique({
        where: { customerId: referral.referrerId },
      });
      if (!referrerAccount) {
        referrerAccount = await tx.loyaltyAccount.create({
          data: { customerId: referral.referrerId, balance: 0, tier: 'MEMBER' },
        });
      }

      await tx.loyaltyTransaction.create({
        data: {
          accountId: referrerAccount.id,
          type: LoyaltyTxType.EARN,
          points: 250, // Standard referral reward
          orderId,
          reason: `Referral reward for introducing client ${newCustomerId}`,
        },
      });

      await tx.loyaltyAccount.update({
        where: { id: referrerAccount.id },
        data: { balance: referrerAccount.balance + 250 },
      });

      return { success: true, rewardPoints: 250 };
    });
  }

  /**
   * Abandoned cart scanner: Find unpurchased carts with customer email.
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
        // Idempotency check: don't enqueue if job already exists in queue for this cart in last 48h
        const existingJob = await prisma.notificationJob.findFirst({
          where: {
            type: 'ABANDONED_CART',
            payload: { path: ['to'], equals: c.customer.email },
            createdAt: { gte: fortyEightHoursAgo },
          },
        });

        if (!existingJob) {
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
