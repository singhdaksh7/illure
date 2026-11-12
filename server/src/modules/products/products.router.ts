import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const publicProductsRouter = Router();
publicProductsRouter.get('/facets', ProductsController.getFacets);
publicProductsRouter.get('/search', ProductsController.search);
publicProductsRouter.get('/', ProductsController.listPublic);
publicProductsRouter.get('/:slug', ProductsController.getPublicBySlug);

export const adminProductsRouter = Router();
adminProductsRouter.use(requireAdminAuth);
adminProductsRouter.get('/', ProductsController.listAdmin);
adminProductsRouter.post('/', ProductsController.create);
adminProductsRouter.post('/:id/duplicate', ProductsController.duplicate);
adminProductsRouter.get('/:id', ProductsController.getById);
adminProductsRouter.patch('/:id', ProductsController.update);
adminProductsRouter.delete('/:id', ProductsController.delete);

const router = Router();
router.use('/', publicProductsRouter);
export default router;
