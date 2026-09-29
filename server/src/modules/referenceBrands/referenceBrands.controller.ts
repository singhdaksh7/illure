import { Request, Response, NextFunction } from 'express';
import { ReferenceBrandsService } from './referenceBrands.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class ReferenceBrandsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const adminMode = req.path.startsWith('/admin') || !!(req as any).adminUser;
      const brands = await ReferenceBrandsService.listBrands(adminMode);
      return sendSuccess(res, { brands });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const brand = await ReferenceBrandsService.getBrandById(id);
      return sendSuccess(res, { brand });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const brand = await ReferenceBrandsService.createBrand(req.body);
      return sendSuccess(res, { brand }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const brand = await ReferenceBrandsService.updateBrand(id, req.body);
      return sendSuccess(res, { brand });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const brand = await ReferenceBrandsService.deleteBrand(id);
      return sendSuccess(res, { brand, message: 'Reference brand removed or deactivated successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
