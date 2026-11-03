import { Router } from 'express';
import { CategoriesController } from './categories.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const publicCategoriesRouter = Router();
publicCategoriesRouter.get('/public', CategoriesController.list);

export const adminCategoriesRouter = Router();
adminCategoriesRouter.use(requireAdminAuth);
adminCategoriesRouter.get('/', CategoriesController.list);
adminCategoriesRouter.post('/', CategoriesController.create);
adminCategoriesRouter.get('/:id', CategoriesController.getById);
adminCategoriesRouter.patch('/:id', CategoriesController.update);
adminCategoriesRouter.delete('/:id', CategoriesController.delete);

const router = Router();
router.use('/', publicCategoriesRouter);
export default router;
