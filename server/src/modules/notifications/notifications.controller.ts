import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class NotificationsController {
  static async listJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, type, page, limit } = req.query;
      const data = await NotificationsService.listJobs({
        status: status as any,
        type: type as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }

  static async retryJob(req: Request, res: Response, next: NextFunction) {
    try {
      const jobId = String(req.params.jobId || '');
      const job = await NotificationsService.retryJob(jobId);
      return sendSuccess(res, job, 'Notification job queued for retry.');
    } catch (err) {
      next(err);
    }
  }

  static async triggerDrain(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationsService.drainQueue();
      return sendSuccess(res, result, 'Queue drained successfully.');
    } catch (err) {
      next(err);
    }
  }
}
