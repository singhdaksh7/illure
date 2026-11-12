import { Request, Response, NextFunction } from 'express';
import { ShiprocketService } from './shiprocket.service.js';
import { prisma } from '../../utils/prisma.js';

export class ShippingController {
  static async checkServiceability(req: Request, res: Response, next: NextFunction) {
    try {
      const { pincode, weightKg, cod } = req.query;
      if (!pincode) {
        return res.status(400).json({ success: false, error: { message: 'Pincode is required.' } });
      }
      const result = await ShiprocketService.checkServiceability(
        String(pincode),
        undefined,
        weightKg ? Number(weightKg) : 0.5,
        cod === 'true' || cod === '1' ? 1 : 0
      );
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async createShipment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, weightGrams, lengthCm, breadthCm, heightCm } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, error: { message: 'orderId is required.' } });
      }

      const result = await ShiprocketService.createOrderShipment({
        orderId,
        weightGrams,
        lengthCm,
        breadthCm,
        heightCm,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async listShipments(req: Request, res: Response, next: NextFunction) {
    try {
      const shipments = await prisma.shipment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              paymentStatus: true,
              customerName: true,
              customerEmail: true,
              customerPhone: true,
              shippingAddress: true,
            },
          },
        },
      });
      return res.status(200).json({ success: true, data: { shipments } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Neutral Webhook Receiver
   * Handles POST /api/webhooks/shipping/receive
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ShiprocketService.handleWebhook(req.headers, req.body);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
