import { Router } from 'express';
import { CustomerAuthController } from './customerAuth.controller.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { customerRegisterSchema, customerLoginSchema } from './customerAuth.validation.js';
import { requireCustomerAuth } from '../../middleware/customerAuth.middleware.js';
import { loginLimiter } from '../../middleware/rateLimit.middleware.js';

const customerAuthRouter = Router();

customerAuthRouter.post(
  '/register',
  loginLimiter,
  validateRequest({ body: customerRegisterSchema }),
  CustomerAuthController.register
);

customerAuthRouter.post(
  '/login',
  loginLimiter,
  validateRequest({ body: customerLoginSchema }),
  CustomerAuthController.login
);

customerAuthRouter.post('/refresh', CustomerAuthController.refresh);
customerAuthRouter.post('/logout', CustomerAuthController.logout);
customerAuthRouter.get('/me', requireCustomerAuth, CustomerAuthController.me);

export default customerAuthRouter;
