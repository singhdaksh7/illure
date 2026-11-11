import { Request, Response, NextFunction } from 'express';
import { DiscoverySetsService } from './discoverySets.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class DiscoverySetsController {
  static async listPublic(_req: Request, res: Response, next: NextFunction) {
    try {
      const sets = await DiscoverySetsService.listPublic();
      return sendSuccess(res, { sets });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const set = await DiscoverySetsService.getBySlug(slug);
      return sendSuccess(res, { set });
    } catch (error) {
      next(error);
    }
  }

  static async validateSelection(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const { selectionVariantIds } = req.body;
      const result = await DiscoverySetsService.validateAndPriceSelection(slug, selectionVariantIds);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Admin Controllers
  static async listAdmin(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sets = await DiscoverySetsService.listAdmin();
      return sendSuccess(res, { sets });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const set = await DiscoverySetsService.create(req.body);
      return sendSuccess(res, { set }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const set = await DiscoverySetsService.update(id, req.body);
      return sendSuccess(res, { set });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await DiscoverySetsService.delete(id);
      return sendSuccess(res, { message: 'Discovery set configuration deleted.' });
    } catch (error) {
      next(error);
    }
  }
}
