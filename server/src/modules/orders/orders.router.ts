import { Router } from 'express';
import { OrdersController } from './orders.controller.js';
import { optionalCustomerAuth, requireCustomerAuth } from '../../middleware/customerAuth.middleware.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

export const checkoutRouter = Router();
checkoutRouter.post('/summary', optionalCustomerAuth, OrdersController.getCheckoutSummary);

export const adminOrdersRouter = Router();
adminOrdersRouter.use(requireAdminAuth);
adminOrdersRouter.get('/', OrdersController.getAdminOrders);
adminOrdersRouter.get('/:id', OrdersController.getAdminOrderDetails);
adminOrdersRouter.patch(
  '/:id/status',
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.ORDER_MANAGER),
  OrdersController.updateOrderStatus
);

const ordersRouter = Router();
ordersRouter.post('/', optionalCustomerAuth, OrdersController.createOrder);
ordersRouter.get('/my', requireCustomerAuth, OrdersController.getCustomerOrders);
ordersRouter.post('/lookup', OrdersController.guestOrderLookup);
ordersRouter.get('/:orderNumber', optionalCustomerAuth, OrdersController.getCustomerOrderDetails);

export default ordersRouter;
