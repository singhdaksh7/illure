import { prisma } from '../../utils/prisma.js';
import { ReturnStatus, RiskSeverity } from '@prisma/client';

export class OperationsService {
  /**
   * Allowed order status transitions state machine.
   */
  static readonly ALLOWED_TRANSITIONS: Record<string, string[]> = {
    PENDING: ['PROCESSING', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'RETURNED'],
    DELIVERED: ['RETURNED'],
    CANCELLED: [],
    RETURNED: [],
  };

  /**
   * Customer-initiated cancellation: Allowed strictly if order is in PENDING or CONFIRMED state.
   */
  static async cancelOrder(customerId: string, orderId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, customerId },
        include: { items: true },
      });

      if (!order) {
        throw { statusCode: 404, code: 'NOT_FOUND', message: 'Order not found.' };
      }

      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        throw {
          statusCode: 400,
          code: 'CANCELLATION_NOT_ALLOWED',
          message: `Order in ${order.status} state cannot be cancelled. Only unfulfilled orders can be cancelled.`,
        };
      }

      // Restore stock for cancelled order items
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          statusHistory: {
            create: {
              oldStatus: order.status,
              newStatus: 'CANCELLED',
              note: `Customer cancellation: ${reason || 'Customer request'}`,
            },
          },
        },
      });

      return updated;
    });
  }

  /**
   * Request a return on a delivered order.
   */
  static async requestReturn(customerId: string, data: {
    orderId: string;
    items: Array<{ orderItemId: string; quantity: number; reason: string }>;
    reason: string;
    evidenceUrls?: string[];
  }) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, customerId },
    });

    if (!order) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Delivered order not found for return.' };
    }

    if (order.status !== 'DELIVERED') {
      throw { statusCode: 400, code: 'INVALID_STATUS', message: 'Returns can only be requested for DELIVERED orders.' };
    }

    return prisma.orderReturnRequest.create({
      data: {
        orderId: data.orderId,
        customerId,
        items: data.items,
        reason: data.reason,
        evidenceUrls: data.evidenceUrls || [],
        status: ReturnStatus.PENDING,
      },
    });
  }

  /**
   * Check pincode serviceability and COD eligibility.
   */
  static async checkPincode(pincode: string) {
    const clean = (pincode || '').trim();
    if (!/^\d{6}$/.test(clean)) {
      throw { statusCode: 400, code: 'INVALID_PINCODE', message: 'Pincode must be exactly 6 digits.' };
    }

    const rule = await prisma.pincodeRule.findUnique({
      where: { pincode: clean },
    });

    if (rule) {
      return {
        pincode: rule.pincode,
        isServiceable: rule.isServiceable,
        isCodAllowed: rule.isCodAllowed,
        estimatedDays: rule.estimatedDays,
        city: rule.city || 'India',
        state: rule.state || 'India',
      };
    }

    // Default pan-India courier serviceability baseline
    return {
      pincode: clean,
      isServiceable: true,
      isCodAllowed: true,
      estimatedDays: 3,
      city: 'India',
      state: 'India',
    };
  }

  /**
   * Check risk flags for an order (COD high value, suspicious address).
   */
  static async evaluateOrderRisk(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shippingAddress: true },
    });

    if (!order) return null;

    const flags: Array<{ reason: string; severity: RiskSeverity }> = [];
    const amount = Number(order.totalAmount);

    if (amount > 15000 && order.paymentStatus === 'PENDING') {
      flags.push({
        reason: `High value COD order (₹${amount.toLocaleString('en-IN')}) requires manual confirmation.`,
        severity: RiskSeverity.HIGH,
      });
    }

    for (const f of flags) {
      await prisma.riskFlag.create({
        data: {
          orderId: order.id,
          customerId: order.customerId,
          reason: f.reason,
          severity: f.severity,
        },
      });
    }

    return flags;
  }

  /**
   * Generate invoice data for order.
   */
  static async getInvoiceData(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
      },
    });

    if (!order) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Order not found.' };
    }

    return {
      invoiceNumber: `INV-${order.orderNumber}`,
      date: order.createdAt,
      brand: {
        name: 'İLLURÊ FRAGRANCE',
        gstin: '07AAACI1234F1Z1',
        address: 'İLLURÊ Atelier, Mehrauli, New Delhi 110030',
        supportEmail: 'concierge@illure.in',
      },
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        shippingAddress: order.shippingAddress,
      },
      items: order.items.map((item) => ({
        name: item.productName,
        size: item.sizeLabel,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.lineTotal),
      })),
      pricing: {
        subtotal: Number(order.subtotal),
        discount: Number(order.discountAmount),
        shipping: Number(order.shippingAmount),
        giftPackaging: Number(order.giftPackagingAmount),
        total: Number(order.totalAmount),
      },
      paymentStatus: order.paymentStatus,
    };
  }

  /**
   * List return requests for admin.
   */
  static async listReturns(status?: ReturnStatus) {
    const where: any = {};
    if (status) where.status = status;

    return prisma.orderReturnRequest.findMany({
      where,
      include: {
        order: { select: { orderNumber: true, totalAmount: true } },
        customer: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
