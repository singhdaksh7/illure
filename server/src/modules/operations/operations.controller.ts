import { Request, Response, NextFunction } from 'express';
import { OperationsService } from './operations.service.js';
import { sendSuccess } from '../../utils/response.utils.js';

export class OperationsController {
  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const orderId = String(req.params.orderId || '');
      const { reason } = req.body;
      const result = await OperationsService.cancelOrder(customerId, orderId, reason);
      return sendSuccess(res, result, 'Order cancelled successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async requestReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).customer.id;
      const result = await OperationsService.requestReturn(customerId, req.body);
      return sendSuccess(res, result, 'Return request submitted.', 201);
    } catch (err) {
      next(err);
    }
  }

  static async checkPincode(req: Request, res: Response, next: NextFunction) {
    try {
      const pincode = String(req.params.pincode || '');
      const result = await OperationsService.checkPincode(pincode);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = String(req.params.orderId || '');
      const result = await OperationsService.getInvoiceData(orderId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async listReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const result = await OperationsService.listReturns(status as any);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}
