import { Request, Response, NextFunction } from 'express';
import { CmsService } from './cms.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class CmsController {
  /**
   * Public: Retrieve homepage sections and global site settings
   */
  static async getPublicCmsData(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CmsService.getPublicCmsData();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all homepage sections
   */
  static async getAllSections(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sections = await CmsService.getAllSections();
      return sendSuccess(res, { sections });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update section
   */
  static async updateSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const updated = await CmsService.updateSection(id, req.body);
      return sendSuccess(res, { section: updated }, 'Homepage section updated successfully.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Reorder sections
   */
  static async reorderSections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        throw { statusCode: 400, code: 'BAD_REQUEST', message: 'orderedIds must be an array of section IDs.' };
      }
      const sections = await CmsService.reorderSections(orderedIds);
      return sendSuccess(res, { sections }, 'Homepage sections reordered successfully.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get all settings
   */
  static async getAllSettings(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await CmsService.getAllSettings();
      return sendSuccess(res, { settings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update setting by key
   */
  static async updateSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const key = String(req.params.key);
      const { value } = req.body;
      const updated = await CmsService.updateSetting(key, value);
      return sendSuccess(res, { setting: updated }, `Setting '${key}' updated successfully.`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Reset / Seed default CMS values
   */
  static async seedDefaults(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await CmsService.seedDefaultsIfNeeded();
      const data = await CmsService.getPublicCmsData();
      return sendSuccess(res, data, 'CMS defaults seeded successfully.');
    } catch (error) {
      next(error);
    }
  }
}
