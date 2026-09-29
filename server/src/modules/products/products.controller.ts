import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class ProductsController {
  // ==========================================
  // ADMIN CONTROLLERS
  // ==========================================

  static async listAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProductsService.listAdminProducts(req.query as any);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductsService.getProductById(id);
      return sendSuccess(res, { product });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.adminUser?.id;
      const product = await ProductsService.createProduct(req.body, adminId);
      return sendSuccess(res, { product }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.adminUser?.id;
      const id = req.params.id as string;
      const product = await ProductsService.updateProduct(id, req.body, adminId);
      return sendSuccess(res, { product });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await ProductsService.deleteProduct(id);
      return sendSuccess(res, { product, message: 'Product archived or deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PUBLIC CONTROLLERS
  // ==========================================

  static async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductsService.listPublicProducts(req.query as any);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async getPublicBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const product = await ProductsService.getPublicProductBySlug(slug);
      return sendSuccess(res, { product });
    } catch (error) {
      next(error);
    }
  }
}
