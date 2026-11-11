import { Router } from 'express';
import { FeaturesController } from './features.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

export const publicFeaturesRouter = Router();
publicFeaturesRouter.get('/', FeaturesController.getPublicFeatures);
publicFeaturesRouter.post('/track-event', FeaturesController.trackEvent);

export const adminFeaturesRouter = Router();
adminFeaturesRouter.use(requireAdminAuth);
// Only SUPER_ADMIN and ADMIN can modify global feature configurations
adminFeaturesRouter.use(requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN));

adminFeaturesRouter.get('/', FeaturesController.getAllFeatures);
adminFeaturesRouter.get('/:key', FeaturesController.getFeatureByKey);
adminFeaturesRouter.patch('/:key', FeaturesController.updateFeature);
adminFeaturesRouter.post('/seed', FeaturesController.seedDefaults);
