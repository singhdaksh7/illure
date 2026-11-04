import { Router } from 'express';
import { CmsController } from './cms.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

export const publicCmsRouter = Router();
publicCmsRouter.get('/', CmsController.getPublicCmsData);

export const adminCmsRouter = Router();
adminCmsRouter.use(requireAdminAuth);
adminCmsRouter.use(requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN));

adminCmsRouter.get('/sections', CmsController.getAllSections);
adminCmsRouter.patch('/sections/reorder', CmsController.reorderSections);
adminCmsRouter.patch('/sections/:id', CmsController.updateSection);

adminCmsRouter.get('/settings', CmsController.getAllSettings);
adminCmsRouter.patch('/settings/:key', CmsController.updateSetting);
adminCmsRouter.post('/seed-defaults', CmsController.seedDefaults);
