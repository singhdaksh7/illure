import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller.js';
import { requireCustomerAuth } from '../../middleware/customerAuth.middleware.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const loyaltyRouter = Router();

loyaltyRouter.get('/account', requireCustomerAuth, LoyaltyController.getAccount);
loyaltyRouter.post('/redeem', requireCustomerAuth, LoyaltyController.redeem);
loyaltyRouter.get('/referral', requireCustomerAuth, LoyaltyController.getReferral);
loyaltyRouter.get('/drops', LoyaltyController.getDrops);
loyaltyRouter.post('/admin/abandoned-cart-scan', requireAdminAuth, LoyaltyController.runAbandonedCartScan);
