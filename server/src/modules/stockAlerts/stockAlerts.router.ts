import { Router } from 'express';
import { StockAlertsController } from './stockAlerts.controller.js';
import { optionalCustomerAuth } from '../../middleware/customerAuth.middleware.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const publicStockAlertsRouter = Router();
publicStockAlertsRouter.post('/subscribe', optionalCustomerAuth, StockAlertsController.subscribe);

export const adminStockAlertsRouter = Router();
adminStockAlertsRouter.use(requireAdminAuth);
adminStockAlertsRouter.get('/', StockAlertsController.listAdmin);
