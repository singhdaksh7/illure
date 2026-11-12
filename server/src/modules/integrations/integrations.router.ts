import { Router } from 'express';
import { IntegrationsController } from './integrations.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Only SUPER_ADMIN can view, update or test credentials
router.use(requireAdminAuth, requireAdminRole(AdminRole.SUPER_ADMIN));

router.get('/admin/integrations', IntegrationsController.list);
router.put('/admin/integrations/:provider', IntegrationsController.save);
router.post('/admin/integrations/:provider/test', IntegrationsController.testConnection);

export default router;
