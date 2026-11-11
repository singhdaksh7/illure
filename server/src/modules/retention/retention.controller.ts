import { Request, Response, NextFunction } from 'express';
import { RetentionService } from './retention.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class RetentionController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const profile = await RetentionService.getScentProfile(customerId);
      return sendSuccess(res, profile || {});
    } catch (err) {
      next(err);
    }
  }

  static async saveProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const profile = await RetentionService.upsertScentProfile(customerId, req.body);
      return sendSuccess(res, profile, 'Scent profile saved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer?.id;
      const recommendations = await RetentionService.getRecommendations(customerId);
      return sendSuccess(res, recommendations);
    } catch (err) {
      next(err);
    }
  }

  static async getBuyAgain(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const items = await RetentionService.getBuyAgainItems(customerId);
      return sendSuccess(res, items);
    } catch (err) {
      next(err);
    }
  }

  static async submitReview(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const review = await RetentionService.submitReview(customerId, req.body);
      return sendSuccess(res, review, 'Review submitted successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  static async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = String(req.params.productId || '');
      const result = await RetentionService.getProductReviews(productId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
