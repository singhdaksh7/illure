import { Request, Response, NextFunction } from 'express';
import { GiftingService } from './gifting.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class GiftingController {
  static async issueGiftCard(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).user?.customerId || (req as any).customer?.id;
      const card = await GiftingService.issueGiftCard({
        ...req.body,
        purchasedByCustomerId: customerId,
      });
      return sendSuccess(res, card, 'Gift card issued successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  static async checkBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const code = String(req.params.code || '');
      const result = await GiftingService.checkBalance(code);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async redeem(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, amount } = req.body;
      if (!code || !amount) {
        throw { statusCode: 400, code: 'BAD_REQUEST', message: 'code and amount are required.' };
      }
      const result = await GiftingService.redeem(String(code), Number(amount));
      return sendSuccess(res, result, 'Gift card redeemed successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getFreeSamplesEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const subtotal = Number(req.query.subtotal || 0);
      const result = GiftingService.getFreeSamplesEligibility(subtotal);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async findGift(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipient, budget, vibe } = req.query;
      const result = await GiftingService.findGift({
        recipient: recipient as string,
        budget: budget ? Number(budget) : undefined,
        vibe: vibe as string,
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
