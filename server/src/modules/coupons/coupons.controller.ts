import { Request, Response, NextFunction } from 'express';
import { CouponService } from './coupons.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class CouponController {
  static async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body;
      const result = await CouponService.validateCoupon(code, subtotal);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
