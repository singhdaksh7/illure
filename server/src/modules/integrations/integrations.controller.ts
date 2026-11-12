import { Request, Response, NextFunction } from 'express';
import { IntegrationsService } from './integrations.service.js';

export class IntegrationsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = (req as any).adminUser?.role === 'SUPER_ADMIN';
      const list = await IntegrationsService.listIntegrations(isSuperAdmin);
      return res.status(200).json({ success: true, data: { integrations: list } });
    } catch (err) {
      next(err);
    }
  }

  static async save(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = String(req.params.provider);
      const { isEnabled, credentials, settings } = req.body;

      const saved = await IntegrationsService.saveIntegration({
        provider,
        isEnabled,
        credentials,
        settings,
      });

      return res.status(200).json({ success: true, data: { integration: saved } });
    } catch (err) {
      next(err);
    }
  }

  static async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = String(req.params.provider);
      const result = await IntegrationsService.testIntegration(provider);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
