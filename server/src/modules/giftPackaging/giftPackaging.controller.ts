import { Request, Response, NextFunction } from 'express';
import { GiftPackagingService } from './giftPackaging.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class GiftPackagingController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const adminMode = req.path.startsWith('/admin') || !!(req as any).adminUser;
      const giftPackaging = await GiftPackagingService.listGiftPackaging(adminMode);
      return sendSuccess(res, { giftPackaging });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const giftPackaging = await GiftPackagingService.getById(id);
      return sendSuccess(res, { giftPackaging });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const giftPackaging = await GiftPackagingService.createGiftPackaging(req.body);
      return sendSuccess(res, { giftPackaging }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const giftPackaging = await GiftPackagingService.updateGiftPackaging(id, req.body);
      return sendSuccess(res, { giftPackaging });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const giftPackaging = await GiftPackagingService.deleteGiftPackaging(id);
      return sendSuccess(res, { giftPackaging, message: 'Gift packaging option removed successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
