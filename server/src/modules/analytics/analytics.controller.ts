import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class AnalyticsController {
  static async getExecutiveMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const data = await AnalyticsService.getExecutiveMetrics(days);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async exportOrdersCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await AnalyticsService.exportOrdersCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="illure-orders-export.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}
