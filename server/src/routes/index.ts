import { Router } from 'express';
import healthRouter from './health.router.js';
import authRouter from '../modules/auth/auth.router.js';
import adminsRouter from '../modules/admins/admins.router.js';
import productsRouter from '../modules/products/products.router.js';
import categoriesRouter from '../modules/categories/categories.router.js';
import referenceBrandsRouter from '../modules/referenceBrands/referenceBrands.router.js';
import inventoryRouter from '../modules/inventory/inventory.router.js';
import giftPackagingRouter from '../modules/giftPackaging/giftPackaging.router.js';
import customersRouter from '../modules/customers/customers.router.js';
import cartRouter from '../modules/cart/cart.router.js';
import ordersRouter from '../modules/orders/orders.router.js';
import paymentsRouter from '../modules/payments/payments.router.js';
import couponsRouter from '../modules/coupons/coupons.router.js';
import settingsRouter from '../modules/settings/settings.router.js';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/admin/auth', authRouter);
apiRouter.use('/admin/users', adminsRouter);

// Module Boundaries
apiRouter.use('/products', productsRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/reference-brands', referenceBrandsRouter);
apiRouter.use('/inventory', inventoryRouter);
apiRouter.use('/gift-packaging', giftPackagingRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/coupons', couponsRouter);
apiRouter.use('/settings', settingsRouter);

export default apiRouter;
