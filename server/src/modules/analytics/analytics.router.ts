import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

export const analyticsRouter = Router();

// Public click tracking event intake (supports both /events/click directly or mounted)
analyticsRouter.post('/', AnalyticsController.recordClick);
analyticsRouter.post('/events/click', AnalyticsController.recordClick);

// Admin Analytics Metrics
analyticsRouter.get('/executive', requireAdminAuth, AnalyticsController.getExecutiveMetrics);
analyticsRouter.get('/clicks', requireAdminAuth, AnalyticsController.getClickMetrics);
analyticsRouter.get('/export/orders.csv', requireAdminAuth, AnalyticsController.exportOrdersCsv);
analyticsRouter.get('/export/inventory.csv', requireAdminAuth, AnalyticsController.exportInventoryCsv);
