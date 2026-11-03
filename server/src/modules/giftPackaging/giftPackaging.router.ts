import { Router } from 'express';
import { GiftPackagingController } from './giftPackaging.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const publicGiftPackagingRouter = Router();
publicGiftPackagingRouter.get('/public', GiftPackagingController.list);

export const adminGiftPackagingRouter = Router();
adminGiftPackagingRouter.use(requireAdminAuth);
adminGiftPackagingRouter.get('/', GiftPackagingController.list);
adminGiftPackagingRouter.post('/', GiftPackagingController.create);
adminGiftPackagingRouter.get('/:id', GiftPackagingController.getById);
adminGiftPackagingRouter.patch('/:id', GiftPackagingController.update);
adminGiftPackagingRouter.delete('/:id', GiftPackagingController.delete);

const router = Router();
router.use('/', publicGiftPackagingRouter);
export default router;
