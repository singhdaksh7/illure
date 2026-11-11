import { Request, Response, NextFunction } from 'express';
import { FeaturesService } from './features.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { FeatureGroup } from '@prisma/client';

export class FeaturesController {
  /**
   * Public: GET /api/features
   */
  static async getPublicFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await FeaturesService.getPublicFeatures();
      return sendSuccess(res, data, 'Features loaded.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: POST /api/features/track-event
   */
  static async trackEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventType, featureKey, metadata, sessionId } = req.body;
      const customerId = (req as any).customer?.id || null;

      if (!eventType || typeof eventType !== 'string') {
        return res.status(400).json({ success: false, message: 'eventType is required' });
      }

      await FeaturesService.logEvent({
        eventType,
        featureKey,
        customerId,
        sessionId,
        metadata,
      });

      return sendSuccess(res, { tracked: true }, 'Event tracked.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: GET /api/admin/features
   */
  static async getAllFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const group = req.query.group as FeatureGroup | undefined;
      const data = await FeaturesService.getAllFeaturesForAdmin(group);
      return sendSuccess(res, data, 'All features retrieved.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: GET /api/admin/features/:key
   */
  static async getFeatureByKey(req: Request, res: Response, next: NextFunction) {
    try {
      const key = String(req.params.key);
      const feature = await FeaturesService.getFeatureByKey(key);
      return sendSuccess(res, { feature }, 'Feature details retrieved.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: PATCH /api/admin/features/:key
   */
  static async updateFeature(req: Request, res: Response, next: NextFunction) {
    try {
      const key = String(req.params.key);
      const admin = (req as any).adminUser || (req as any).admin;
      const reqMeta = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const updated = await FeaturesService.updateFeature(key, req.body, admin, reqMeta);
      return sendSuccess(res, { feature: updated }, 'Feature updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: POST /api/admin/features/seed
   */
  static async seedDefaults(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await FeaturesService.seedDefaults();
      return sendSuccess(res, { seeded: count }, `Seeded ${count} default features.`);
    } catch (error) {
      next(error);
    }
  }
}
