import { Router } from 'express';
import { IntegrationsController } from './integrations.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// SUPER_ADMIN and ADMIN can view integration status (non-super admins get masked status only)
router.get('/admin/integrations', requireAdminAuth, requireAdminRole(AdminRole.ADMIN), IntegrationsController.list);

// Only SUPER_ADMIN can update or test credentials
router.put('/admin/integrations/:provider', requireAdminAuth, requireAdminRole(AdminRole.SUPER_ADMIN), IntegrationsController.save);
router.post('/admin/integrations/:provider/test', requireAdminAuth, requireAdminRole(AdminRole.SUPER_ADMIN), IntegrationsController.testConnection);

export default router;
