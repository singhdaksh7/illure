import { Router } from 'express';
import { ShippingController } from './shipping.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Public / Storefront Serviceability Check
router.get('/shipping/serviceability', ShippingController.checkServiceability);

// Neutral Webhook Endpoint (No keyword filters, handles carrier callbacks safely)
router.post('/webhooks/shipping/receive', ShippingController.handleWebhook);

// Admin Shipping Operations
router.get(
  '/admin/shipping/shipments',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.ORDER_MANAGER),
  ShippingController.listShipments
);

router.post(
  '/admin/shipping/create-shipment',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.ORDER_MANAGER),
  ShippingController.createShipment
);

export default router;
