import { Request, Response, NextFunction } from 'express';
import { StockAlertsService } from './stockAlerts.service.js';
import { CustomerAuthenticatedRequest } from '../../middleware/customerAuth.middleware.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class StockAlertsController {
  static async subscribe(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { variantId, email } = req.body;
      const customerId = req.customer?.id;
      const sub = await StockAlertsService.subscribe(variantId, email, customerId);
      return sendSuccess(res, { subscription: sub, message: 'You will be notified as soon as this fragrance returns to stock.' }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async listAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 20;
      const result = await StockAlertsService.listAdminAlerts(page, pageSize);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
