import { Router } from 'express';
import { AdminsController } from './admins.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAdminAuth, requireAdminRole('SUPER_ADMIN', 'ADMIN'), AdminsController.list);

export default router;
