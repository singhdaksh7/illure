import { Router } from 'express';
import { WishlistController } from './wishlist.controller.js';
import { requireCustomerAuth } from '../../middleware/customerAuth.middleware.js';

const router = Router();

router.use(requireCustomerAuth);

router.get('/', WishlistController.getWishlist);
router.post('/merge', WishlistController.mergeWishlist);
router.post('/:productId', WishlistController.addItem);
router.delete('/:productId', WishlistController.removeItem);

export default router;
