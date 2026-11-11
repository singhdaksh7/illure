import { prisma } from '../../utils/prisma.js';
import { StockAlertStatus } from '@prisma/client';
import { EmailService } from '../../utils/email.service.js';

export class StockAlertsService {
  static async subscribe(variantId: string, email: string, customerId?: string) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw { statusCode: 400, code: 'INVALID_EMAIL', message: 'A valid email address is required.' };
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || !variant.isActive || variant.product.status !== 'ACTIVE') {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Product variant not found or inactive.' };
    }

    if (variant.stockQuantity > 0) {
      throw { statusCode: 400, code: 'ALREADY_IN_STOCK', message: 'This variant is currently in stock. No notification needed.' };
    }

    const subscription = await prisma.stockAlertSubscription.upsert({
      where: {
        productVariantId_email_status: {
          productVariantId: variant.id,
          email: cleanEmail,
          status: StockAlertStatus.ACTIVE,
        },
      },
      create: {
        productVariantId: variant.id,
        email: cleanEmail,
        customerId: customerId || null,
        status: StockAlertStatus.ACTIVE,
      },
      update: {
        customerId: customerId || null,
      },
    });

    return subscription;
  }

  static async notifyRestock(variantId: string, newStock: number) {
    if (newStock <= 0) return { notifiedCount: 0 };

    const activeSubs = await prisma.stockAlertSubscription.findMany({
      where: {
        productVariantId: variantId,
        status: StockAlertStatus.ACTIVE,
      },
      include: {
        variant: {
          include: { product: true },
        },
      },
    });

    if (activeSubs.length === 0) return { notifiedCount: 0 };

    const now = new Date();
    let sentCount = 0;

    for (const sub of activeSubs) {
      try {
        await EmailService.sendBackInStockEmail({
          to: sub.email,
          productName: sub.variant.product.name,
          variantSize: sub.variant.sizeLabel,
          productSlug: sub.variant.product.slug,
          price: Number(sub.variant.price),
        });

        await prisma.stockAlertSubscription.update({
          where: { id: sub.id },
          data: {
            status: StockAlertStatus.SENT,
            sentAt: now,
          },
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send stock alert email to ${sub.email}:`, err);
      }
    }

    return { notifiedCount: sentCount };
  }

  static async listAdminAlerts(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      prisma.stockAlertSubscription.findMany({
        include: {
          variant: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.stockAlertSubscription.count(),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };
  }
}
