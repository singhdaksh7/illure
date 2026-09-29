import { Response, NextFunction } from 'express';
import { AdminsService } from './admins.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class AdminsController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const admins = await AdminsService.listAdmins();
      return sendSuccess(res, { admins });
    } catch (error) {
      next(error);
    }
  }
}
