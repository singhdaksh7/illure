import { Router } from 'express';
import { InventoryController } from './inventory.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const adminInventoryRouter = Router();
adminInventoryRouter.use(requireAdminAuth);
adminInventoryRouter.get('/low-stock', InventoryController.getLowStock);
adminInventoryRouter.get('/movements', InventoryController.getMovements);
adminInventoryRouter.post('/:variantId/adjust', InventoryController.adjust);

const router = Router();
router.use('/', adminInventoryRouter);
export default router;
