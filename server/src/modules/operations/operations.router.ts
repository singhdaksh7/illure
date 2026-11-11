import { Router } from 'express';
import { OperationsController } from './operations.controller.js';
import { requireCustomerAuth } from '../../middleware/customerAuth.middleware.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const operationsRouter = Router();

operationsRouter.get('/pincode/:pincode', OperationsController.checkPincode);
operationsRouter.get('/orders/:orderId/invoice', OperationsController.getInvoice);
operationsRouter.get('/orders/:orderId/timeline', OperationsController.getTimeline);
operationsRouter.post('/orders/:orderId/cancel', requireCustomerAuth, OperationsController.cancelOrder);
operationsRouter.post('/returns', requireCustomerAuth, OperationsController.requestReturn);
operationsRouter.get('/admin/returns', requireAdminAuth, OperationsController.listReturns);
