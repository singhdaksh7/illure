import { Router } from 'express';
import { DiscoverySetsController } from './discoverySets.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const publicDiscoverySetsRouter = Router();
publicDiscoverySetsRouter.get('/', DiscoverySetsController.listPublic);
publicDiscoverySetsRouter.get('/:slug', DiscoverySetsController.getBySlug);
publicDiscoverySetsRouter.post('/:slug/validate', DiscoverySetsController.validateSelection);

export const adminDiscoverySetsRouter = Router();
adminDiscoverySetsRouter.use(requireAdminAuth);
adminDiscoverySetsRouter.get('/', DiscoverySetsController.listAdmin);
adminDiscoverySetsRouter.post('/', DiscoverySetsController.create);
adminDiscoverySetsRouter.patch('/:id', DiscoverySetsController.update);
adminDiscoverySetsRouter.delete('/:id', DiscoverySetsController.delete);
