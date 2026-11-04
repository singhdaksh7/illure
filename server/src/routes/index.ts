import { Router } from 'express';
import healthRouter from './health.router.js';
import authRouter from '../modules/auth/auth.router.js';
import adminsRouter from '../modules/admins/admins.router.js';
import customerAuthRouter from '../modules/customers/customerAuth.router.js';
import { adminProductsRouter, publicProductsRouter } from '../modules/products/products.router.js';
import categoriesRouter, { adminCategoriesRouter } from '../modules/categories/categories.router.js';
import referenceBrandsRouter, { adminReferenceBrandsRouter } from '../modules/referenceBrands/referenceBrands.router.js';
import { adminInventoryRouter } from '../modules/inventory/inventory.router.js';
import giftPackagingRouter, { adminGiftPackagingRouter } from '../modules/giftPackaging/giftPackaging.router.js';
import customerAddressesRouter from '../modules/customers/customerAddresses.router.js';
import customersRouter from '../modules/customers/customers.router.js';
import cartRouter from '../modules/cart/cart.router.js';
import ordersRouter, { adminOrdersRouter, checkoutRouter } from '../modules/orders/orders.router.js';
import paymentsRouter from '../modules/payments/payments.router.js';
import couponsRouter from '../modules/coupons/coupons.router.js';
import settingsRouter from '../modules/settings/settings.router.js';
import { publicCmsRouter, adminCmsRouter } from '../modules/cms/cms.router.js';

const apiRouter = Router();

// Health
apiRouter.use('/health', healthRouter);

// Customer Auth
apiRouter.use('/auth/customer', customerAuthRouter);

// Admin Auth & User Management
apiRouter.use('/admin/auth', authRouter);
apiRouter.use('/admin/users', adminsRouter);

// Admin Module Endpoints
apiRouter.use('/admin/products', adminProductsRouter);
apiRouter.use('/admin/categories', adminCategoriesRouter);
apiRouter.use('/admin/reference-brands', adminReferenceBrandsRouter);
apiRouter.use('/admin/gift-packaging', adminGiftPackagingRouter);
apiRouter.use('/admin/inventory', adminInventoryRouter);
apiRouter.use('/admin/orders', adminOrdersRouter);
apiRouter.use('/admin/cms', adminCmsRouter);

// Customer & Public Module Endpoints
apiRouter.use('/products', publicProductsRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/reference-brands', referenceBrandsRouter);
apiRouter.use('/gift-packaging', giftPackagingRouter);
apiRouter.use('/customers/addresses', customerAddressesRouter);
apiRouter.use('/customer/addresses', customerAddressesRouter);
apiRouter.use('/customers', customersRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/coupons', couponsRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/cms', publicCmsRouter);

export default apiRouter;
