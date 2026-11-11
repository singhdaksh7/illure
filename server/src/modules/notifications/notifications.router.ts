import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const notificationsRouter = Router();

notificationsRouter.get('/admin/jobs', requireAdminAuth, NotificationsController.listJobs);
notificationsRouter.post('/admin/jobs/:jobId/retry', requireAdminAuth, NotificationsController.retryJob);
notificationsRouter.post('/admin/drain', requireAdminAuth, NotificationsController.triggerDrain);
