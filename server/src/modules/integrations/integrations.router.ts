import { Router } from 'express';
import { IntegrationsController } from './integrations.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Only SUPER_ADMIN can view, update or test credentials
router.get('/admin/integrations', requireAdminAuth, requireAdminRole(AdminRole.SUPER_ADMIN), IntegrationsController.list);
router.put('/admin/integrations/:provider', requireAdminAuth, requireAdminRole(AdminRole.SUPER_ADMIN), IntegrationsController.save);
router.post('/admin/integrations/:provider/test', requireAdminAuth, requireAdminRole(AdminRole.SUPER_ADMIN), IntegrationsController.testConnection);

export default router;
