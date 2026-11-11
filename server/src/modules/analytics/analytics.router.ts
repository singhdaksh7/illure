import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const analyticsRouter = Router();

analyticsRouter.get('/executive', requireAdminAuth, AnalyticsController.getExecutiveMetrics);
analyticsRouter.get('/export/orders.csv', requireAdminAuth, AnalyticsController.exportOrdersCsv);
