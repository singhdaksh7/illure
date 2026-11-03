import { Router } from 'express';
import { CouponController } from './coupons.controller.js';

const router = Router();

router.post('/validate', CouponController.validate);

export default router;
