import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from './categories.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class CategoriesController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const adminMode = req.path.startsWith('/admin') || !!(req as any).adminUser;
      const categories = await CategoriesService.listCategories(adminMode);
      return sendSuccess(res, { categories });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const category = await CategoriesService.getCategoryById(id);
      return sendSuccess(res, { category });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoriesService.createCategory(req.body);
      return sendSuccess(res, { category }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const category = await CategoriesService.updateCategory(id, req.body);
      return sendSuccess(res, { category });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const category = await CategoriesService.deleteCategory(id);
      return sendSuccess(res, { category, message: 'Category removed or deactivated successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
