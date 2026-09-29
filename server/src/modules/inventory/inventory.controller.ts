import { Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class InventoryController {
  static async adjust(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.adminUser?.id;
      const variantId = req.params.variantId as string;
      const result = await InventoryService.adjustStock(variantId, req.body, adminId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await InventoryService.getMovements(req.query as any);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getLowStock(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const lowStockVariants = await InventoryService.getLowStockVariants();
      return sendSuccess(res, { lowStockVariants });
    } catch (error) {
      next(error);
    }
  }
}
