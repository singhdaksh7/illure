import { Router } from 'express';
import { ContentController } from './content.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// ==========================================
// PUBLIC CONTENT ROUTES
// ==========================================
router.get('/content/banners', ContentController.getActiveBanners);
router.get('/content/tickers', ContentController.getActiveTickers);
router.get('/content/pages/:slug', ContentController.getPublicPage);
router.get('/content/redirects/check', ContentController.checkRedirect);

// ==========================================
// ADMIN CONTENT ROUTES
// ==========================================
// Banners
router.get(
  '/admin/content/banners',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.listAdminBanners
);
router.post(
  '/admin/content/banners',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.createBanner
);
router.patch(
  '/admin/content/banners/:id',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.updateBanner
);
router.delete(
  '/admin/content/banners/:id',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.deleteBanner
);

// Tickers
router.get(
  '/admin/content/tickers',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.listAdminTickers
);
router.post(
  '/admin/content/tickers',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.createTicker
);
router.patch(
  '/admin/content/tickers/:id',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.updateTicker
);
router.delete(
  '/admin/content/tickers/:id',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.deleteTicker
);

// Static Pages
router.get(
  '/admin/content/pages',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.listAdminPages
);
router.post(
  '/admin/content/pages',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.createPage
);
router.patch(
  '/admin/content/pages/:id',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.updatePage
);
router.delete(
  '/admin/content/pages/:id',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.deletePage
);

// Redirects
router.get(
  '/admin/content/redirects',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.listAdminRedirects
);
router.post(
  '/admin/content/redirects',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.createRedirect
);
router.delete(
  '/admin/content/redirects/:id',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  ContentController.deleteRedirect
);

export default router;
