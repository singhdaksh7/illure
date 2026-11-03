import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { optionalCustomerAuth, requireCustomerAuth } from '../../middleware/customerAuth.middleware.js';

const router = Router();

router.get('/', optionalCustomerAuth, CartController.getCart);
router.post('/items', optionalCustomerAuth, CartController.addItem);
router.patch('/items/:itemId', optionalCustomerAuth, CartController.updateItem);
router.delete('/items/:itemId', optionalCustomerAuth, CartController.removeItem);
router.delete('/', optionalCustomerAuth, CartController.clearCart);
router.post('/merge', requireCustomerAuth, CartController.mergeCart);

export default router;
