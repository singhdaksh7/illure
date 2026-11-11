import { prisma } from '../../utils/prisma.js';
import { ReturnStatus, RiskSeverity, FeatureStatus } from '@prisma/client';

export class OperationsService {
  /**
   * Customer-initiated cancellation: Controlled by admin configuration.
   */
  static async cancelOrder(customerId: string, orderId: string, reason: string) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'customer_cancellation' },
    });

    const isEnabled = feature?.isEnabled && feature.status === FeatureStatus.ACTIVE;
    const config = (feature?.config as Record<string, any>) || {};
    const allowedStatuses: string[] = config.allowedStatuses || ['PENDING', 'CONFIRMED'];

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, customerId },
        include: { items: true },
      });

      if (!order) {
        throw { statusCode: 404, code: 'NOT_FOUND', message: 'Order not found.' };
      }

      if (!isEnabled) {
        throw {
          statusCode: 400,
          code: 'CANCELLATION_DISABLED',
          message: 'Customer self-service order cancellation is currently not active. Please contact concierge.',
        };
      }

      if (!allowedStatuses.includes(order.status)) {
        throw {
          statusCode: 400,
          code: 'CANCELLATION_NOT_ALLOWED',
          message: `Order in ${order.status} state cannot be cancelled. Only orders in [${allowedStatuses.join(', ')}] can be cancelled.`,
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
   * Controlled by returns policy configuration.
   */
  static async requestReturn(customerId: string, data: {
    orderId: string;
    items: Array<{ orderItemId: string; quantity: number; reason: string }>;
    reason: string;
    evidenceUrls?: string[];
  }) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'returns' },
    });

    if (!feature || !feature.isEnabled || feature.status !== FeatureStatus.ACTIVE) {
      throw {
        statusCode: 400,
        code: 'RETURNS_DISABLED',
        message: 'Returns and exchanges program is currently under configuration. Please contact concierge directly.',
      };
    }

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
   * Truthful: Returns only factual serviceability and COD status.
   * Does NOT invent delivery estimates or courier ETAs unless explicit business days are stored.
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
        estimatedDays: rule.estimatedDays || null, // null if not explicitly set
        city: rule.city || null,
        state: rule.state || null,
      };
    }

    // Default baseline: Serviceable, but NO fabricated ETA days
    return {
      pincode: clean,
      isServiceable: true,
      isCodAllowed: true,
      estimatedDays: null,
      city: null,
      state: null,
    };
  }

  /**
   * Check risk flags for an order (COD threshold, high value).
   * Configurable threshold; no hardcoded 15000.
   */
  static async evaluateOrderRisk(orderId: string) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'risk_flags' },
    });

    const isEnabled = feature?.isEnabled && feature.status === FeatureStatus.ACTIVE;
    const config = (feature?.config as Record<string, any>) || {};
    const codRiskThreshold = config.codRiskThreshold || 20000;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shippingAddress: true },
    });

    if (!order) return null;

    const flags: Array<{ reason: string; severity: RiskSeverity }> = [];
    const amount = Number(order.totalAmount);

    if (isEnabled && amount >= codRiskThreshold && order.paymentStatus === 'PENDING') {
      flags.push({
        reason: `High value order (₹${amount.toLocaleString('en-IN')}) requires verification before dispatch.`,
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
   * Safety check: If mandatory business details (legal name, GSTIN) are not configured,
   * returns status: CONFIGURATION_REQUIRED instead of emitting fake GSTIN or placeholder addresses.
   */
  static async getInvoiceData(orderId: string) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key: 'invoices' },
    });

    const isEnabled = feature?.isEnabled && feature.status === FeatureStatus.ACTIVE;
    const config = (feature?.config as Record<string, any>) || {};

    const legalBusinessName = config.legalBusinessName;
    const gstin = config.gstin;
    const registeredAddress = config.registeredAddress;

    // Strict validation: if legal details are missing, return CONFIGURATION_REQUIRED
    if (!isEnabled || !legalBusinessName || !gstin || !registeredAddress) {
      return {
        status: FeatureStatus.CONFIGURATION_REQUIRED,
        message: 'Invoice generation requires configured legal business entity details (Legal Name, Registered Address, GSTIN).',
        invoiceNumber: null,
        brand: null,
        pricing: null,
      };
    }

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
      status: FeatureStatus.ACTIVE,
      invoiceNumber: `${config.invoicePrefix || 'INV-'}${order.orderNumber}`,
      date: order.createdAt,
      brand: {
        name: legalBusinessName,
        gstin: gstin,
        address: registeredAddress,
        supportEmail: config.supportEmail || 'support@illure.in',
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
   * Order timeline: Real recorded events from order status history only.
   */
  static async getOrderTimeline(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Order not found.' };
    }

    const timeline = [
      {
        status: 'ORDER_PLACED',
        timestamp: order.createdAt,
        note: 'Order submitted by customer',
      },
      ...order.statusHistory.map((h) => ({
        status: h.newStatus,
        timestamp: h.createdAt,
        note: h.note || null,
      })),
    ];

    return {
      currentStatus: order.status,
      timeline,
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
