import { Router } from 'express';
import { ReferenceBrandsController } from './referenceBrands.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const publicReferenceBrandsRouter = Router();
publicReferenceBrandsRouter.get('/public', ReferenceBrandsController.list);

export const adminReferenceBrandsRouter = Router();
adminReferenceBrandsRouter.use(requireAdminAuth);
adminReferenceBrandsRouter.get('/', ReferenceBrandsController.list);
adminReferenceBrandsRouter.post('/', ReferenceBrandsController.create);
adminReferenceBrandsRouter.get('/:id', ReferenceBrandsController.getById);
adminReferenceBrandsRouter.patch('/:id', ReferenceBrandsController.update);
adminReferenceBrandsRouter.delete('/:id', ReferenceBrandsController.delete);

const router = Router();
router.use('/', publicReferenceBrandsRouter);
export default router;
