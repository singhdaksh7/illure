import { Response, NextFunction } from 'express';
import { WishlistService } from './wishlist.service.js';
import { CustomerAuthenticatedRequest } from '../../middleware/customerAuth.middleware.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class WishlistController {
  static async getWishlist(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const items = await WishlistService.getWishlist(customerId);
      return sendSuccess(res, { items });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const productId = req.params.productId as string;
      const item = await WishlistService.addItem(customerId, productId);
      return sendSuccess(res, { item }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const productId = req.params.productId as string;
      const result = await WishlistService.removeItem(customerId, productId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async mergeWishlist(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const { productIds } = req.body;
      const items = await WishlistService.mergeGuestWishlist(customerId, productIds);
      return sendSuccess(res, { items });
    } catch (error) {
      next(error);
    }
  }
}
