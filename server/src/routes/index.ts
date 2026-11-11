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
import { publicFeaturesRouter, adminFeaturesRouter } from '../modules/features/features.router.js';
import wishlistRouter from '../modules/wishlist/wishlist.router.js';
import { publicStockAlertsRouter, adminStockAlertsRouter } from '../modules/stockAlerts/stockAlerts.router.js';
import { publicDiscoverySetsRouter, adminDiscoverySetsRouter } from '../modules/discoverySets/discoverySets.router.js';
import { giftingRouter } from '../modules/gifting/gifting.router.js';
import { retentionRouter } from '../modules/retention/retention.router.js';
import { loyaltyRouter } from '../modules/loyalty/loyalty.router.js';
import { operationsRouter } from '../modules/operations/operations.router.js';
import { analyticsRouter } from '../modules/analytics/analytics.router.js';
import { notificationsRouter } from '../modules/notifications/notifications.router.js';

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
apiRouter.use('/admin/features', adminFeaturesRouter);
apiRouter.use('/admin/discovery-sets', adminDiscoverySetsRouter);
apiRouter.use('/admin/stock-alerts', adminStockAlertsRouter);
apiRouter.use('/admin/analytics', analyticsRouter);
apiRouter.use('/admin/notifications', notificationsRouter);

// Customer & Public Module Endpoints
apiRouter.use('/features', publicFeaturesRouter);
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
apiRouter.use('/wishlist', wishlistRouter);
apiRouter.use('/stock-alerts', publicStockAlertsRouter);
apiRouter.use('/discovery-sets', publicDiscoverySetsRouter);

// New Phases 4-8 Modules
apiRouter.use('/gifting', giftingRouter);
apiRouter.use('/retention', retentionRouter);
apiRouter.use('/loyalty', loyaltyRouter);
apiRouter.use('/operations', operationsRouter);

export default apiRouter;
