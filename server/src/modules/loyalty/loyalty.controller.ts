import { Request, Response, NextFunction } from 'express';
import { LoyaltyService } from './loyalty.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class LoyaltyController {
  static async getAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const account = await LoyaltyService.getOrCreateAccount(customerId);
      return sendSuccess(res, account);
    } catch (err) {
      next(err);
    }
  }

  static async redeem(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const { points } = req.body;
      const result = await LoyaltyService.redeemPoints(customerId, Number(points));
      return sendSuccess(res, result, 'Points redeemed successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getReferral(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const referral = await LoyaltyService.getReferralCode(customerId);
      return sendSuccess(res, referral);
    } catch (err) {
      next(err);
    }
  }

  static async getDrops(req: Request, res: Response, next: NextFunction) {
    try {
      const drops = await LoyaltyService.getActiveDrops();
      return sendSuccess(res, drops);
    } catch (err) {
      next(err);
    }
  }

  static async runAbandonedCartScan(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LoyaltyService.scanAbandonedCarts();
      return sendSuccess(res, result, 'Abandoned cart scan completed.');
    } catch (err) {
      next(err);
    }
  }
}
