import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';

const router = Router();

router.post('/razorpay/create-order', PaymentsController.createRazorpayOrder);
router.post('/razorpay/verify', PaymentsController.verifyRazorpayPayment);
router.post('/razorpay/webhook', PaymentsController.handleWebhook);

export default router;
