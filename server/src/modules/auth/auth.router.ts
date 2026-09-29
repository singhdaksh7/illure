import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { loginSchema } from './auth.validation.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { loginLimiter } from '../../middleware/rateLimit.middleware.js';
import { requireAdminAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/login', loginLimiter, validateRequest({ body: loginSchema }), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', requireAdminAuth, AuthController.me);

export default router;
