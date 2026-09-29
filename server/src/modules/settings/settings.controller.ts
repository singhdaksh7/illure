import { Response, NextFunction } from 'express';
import { SettingsService } from './settings.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class SettingsController {
  static async getShippingSettings(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getShippingSettings();
      return sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  }

  static async updateShippingSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { flatRate, freeShippingThreshold, isEnabled } = req.body;
      const settings = await SettingsService.updateShippingSettings({
        flatRate: flatRate !== undefined ? Number(flatRate) : undefined,
        freeShippingThreshold: freeShippingThreshold !== undefined ? Number(freeShippingThreshold) : undefined,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : undefined,
      });
      return sendSuccess(res, settings, 'Shipping settings updated successfully.');
    } catch (error) {
      next(error);
    }
  }
}
