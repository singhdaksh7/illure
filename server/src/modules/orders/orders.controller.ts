import { Request, Response, NextFunction } from 'express';
import { OrdersService } from './orders.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { CustomerAuthenticatedRequest } from '../../middleware/customerAuth.middleware.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';

export class OrdersController {
  // 1. Checkout Summary
  static async getCheckoutSummary(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      const sessionKey = (req.headers['x-session-key'] as string) || req.body.sessionKey;
      const couponCode = req.body.couponCode;

      const summary = await OrdersService.calculateSummary(customerId, sessionKey, couponCode);
      return sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  // 2. Order Creation
  static async createOrder(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      const sessionKey = (req.headers['x-session-key'] as string) || req.body.sessionKey;

      const order = await OrdersService.createOrder(req.body, customerId, sessionKey);
      return sendSuccess(res, order, 'Order created successfully.', 201);
    } catch (error) {
      next(error);
    }
  }

  // 3. Customer Orders List
  static async getCustomerOrders(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const orders = await OrdersService.getCustomerOrders(customerId);
      return sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  }

  // 4. Customer Order Detail
  static async getCustomerOrderDetails(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer!.id;
      const orderNumber = String(req.params.orderNumber);
      const order = await OrdersService.getCustomerOrderDetails(customerId, orderNumber);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  // 5. Guest Order Lookup
  static async guestOrderLookup(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderNumber, emailOrPhone } = req.body;
      const order = await OrdersService.guestOrderLookup(orderNumber, emailOrPhone);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  // 6. Admin Orders List
  static async getAdminOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, pageSize, status, paymentStatus, search, startDate, endDate } = req.query;
      const result = await OrdersService.getAdminOrders({
        page: page ? parseInt(page as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
        status: status as any,
        paymentStatus: paymentStatus as any,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // 7. Admin Order Detail
  static async getAdminOrderDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const order = await OrdersService.getAdminOrderDetails(id);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  // 8. Admin Update Order Status
  static async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const { status, note } = req.body;
      const adminId = req.adminUser?.id;
      const adminRole = req.adminUser?.role;

      const updated = await OrdersService.updateOrderStatus(id, status, note, adminId, adminRole);
      return sendSuccess(res, updated, `Order status updated to ${status}.`);
    } catch (error) {
      next(error);
    }
  }
}
