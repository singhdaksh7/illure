import { Request, Response, NextFunction } from 'express';
import { OrdersService } from '../orders/orders.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class PaymentsController {
  static async createRazorpayOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      if (!orderId) {
        throw { statusCode: 400, code: 'BAD_REQUEST', message: 'orderId is required.' };
      }
      const data = await OrdersService.createRazorpayOrder(orderId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  static async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const result = await OrdersService.verifyRazorpayPayment({
        orderId,
        orderNumber,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
      return sendSuccess(res, result, 'Razorpay payment verified successfully.');
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

      const result = await OrdersService.processWebhook(rawBody, signature || '');
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
