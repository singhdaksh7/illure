import { prisma } from '../../utils/prisma.js';

export class AnalyticsService {
  /**
   * Neutralize potential CSV injection characters (=, +, -, @)
   */
  static sanitizeCsvCell(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/^[=+\-@]/.test(str)) {
      return `"'${str.replace(/"/g, '""')}"`;
    }
    return `"${str.replace(/"/g, '""')}"`;
  }

  /**
   * Get commerce executive dashboard statistics across a time range.
   */
  static async getExecutiveMetrics(days: number = 30) {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      orders, 
      customersCount, 
      lowStockVariants, 
      wishlistCount, 
      pendingReturns, 
      reviewsCount,
      giftCardsCount
    ] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: sinceDate } },
        include: { items: true },
      }),
      prisma.customer.count({
        where: { createdAt: { gte: sinceDate } },
      }),
      prisma.productVariant.count({
        where: { isActive: true, stockQuantity: { lte: 5 } },
      }),
      prisma.wishlistItem.count(),
      prisma.orderReturnRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.productReview.count({
        where: { status: 'APPROVED' },
      }),
      prisma.giftCard.count({
        where: { status: 'ACTIVE' },
      }),
    ]);

    const totalOrders = orders.length;
    let totalRevenue = 0;
    let prepaidOrders = 0;
    let codOrders = 0;
    let discoverySetSales = 0;
    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const ord of orders) {
      const amt = Number(ord.totalAmount);
      totalRevenue += amt;

      if (ord.paymentStatus === 'PAID') prepaidOrders++;
      else codOrders++;

      for (const item of ord.items) {
        if (item.bundleConfigId) {
          discoverySetSales += item.quantity;
        }

        const existing = productSalesMap.get(item.productName) || {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += Number(item.lineTotal);
        productSalesMap.set(item.productName, existing);
      }
    }

    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const bestsellers = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      periodDays: days,
      metrics: {
        totalRevenue,
        totalOrders,
        aov,
        newCustomers: customersCount,
        prepaidOrders,
        codOrders,
        lowStockAlerts: lowStockVariants,
        wishlistSaves: wishlistCount,
        pendingReturns,
        approvedReviews: reviewsCount,
        activeGiftCards: giftCardsCount,
        discoverySetSales,
      },
      bestsellers,
    };
  }

  /**
   * Export orders in CSV format with CSV Injection neutralization.
   */
  static async exportOrdersCsv(): Promise<string> {
    const orders = await prisma.order.findMany({
      include: { shippingAddress: true, items: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const header = 'Order Number,Date,Customer Name,Phone,Email,Status,Payment Status,Total Amount,City,State\n';
    const rows = orders.map((o) => {
      const date = o.createdAt.toISOString().slice(0, 10);
      const orderNum = this.sanitizeCsvCell(o.orderNumber);
      const name = this.sanitizeCsvCell(o.customerName);
      const phone = this.sanitizeCsvCell(o.customerPhone);
      const email = this.sanitizeCsvCell(o.customerEmail);
      const status = this.sanitizeCsvCell(o.status);
      const payStatus = this.sanitizeCsvCell(o.paymentStatus);
      const total = Number(o.totalAmount).toFixed(2);
      const city = this.sanitizeCsvCell(o.shippingAddress?.city);
      const state = this.sanitizeCsvCell(o.shippingAddress?.state);

      return `${orderNum},${date},${name},${phone},${email},${status},${payStatus},${total},${city},${state}`;
    });

    return header + rows.join('\n');
  }

  /**
   * Export inventory alerts in CSV format.
   */
  static async exportInventoryCsv(): Promise<string> {
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: { product: true },
      orderBy: { stockQuantity: 'asc' },
    });

    const header = 'Product,SKU,Size,Stock Quantity,Threshold,Status\n';
    const rows = variants.map((v) => {
      const product = this.sanitizeCsvCell(v.product.name);
      const sku = this.sanitizeCsvCell(v.sku);
      const size = this.sanitizeCsvCell(v.sizeLabel);
      const stock = v.stockQuantity;
      const threshold = v.lowStockThreshold;
      const status = stock <= 0 ? 'OUT_OF_STOCK' : stock <= threshold ? 'LOW_STOCK' : 'HEALTHY';
      return `${product},${sku},${size},${stock},${threshold},${status}`;
    });

    return header + rows.join('\n');
  }

  /**
   * Ingest storefront click event
   */
  static async recordClickEvent(data: {
    targetType: string; // 'PRODUCT' | 'BANNER' | 'HERO_CTA' | 'COLLECTION'
    targetId?: string;
    targetTitle?: string;
    targetUrl?: string;
    userId?: string;
    anonymousId?: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.commerceEventLog.create({
      data: {
        eventType: 'CLICK',
        customerId: data.userId || null,
        sessionId: data.anonymousId || null,
        metadata: {
          targetType: data.targetType,
          targetId: data.targetId,
          targetTitle: data.targetTitle,
          targetUrl: data.targetUrl,
          ...(data.metadata || {}),
        },
      },
    });
  }

  /**
   * Aggregate click tracking metrics
   */
  static async getClickMetrics(days = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const clickEvents = await prisma.commerceEventLog.findMany({
      where: {
        eventType: 'CLICK',
        createdAt: { gte: cutoff },
      },
      select: {
        metadata: true,
        createdAt: true,
      },
    });

    const byTargetType: Record<string, number> = {
      PRODUCT: 0,
      BANNER: 0,
      HERO_CTA: 0,
      COLLECTION: 0,
      OTHER: 0,
    };

    const topItemsMap: Record<string, { title: string; type: string; count: number }> = {};

    for (const ev of clickEvents) {
      const meta = (ev.metadata as any) || {};
      const type = meta.targetType || 'OTHER';
      byTargetType[type] = (byTargetType[type] || 0) + 1;

      const itemKey = `${type}:${meta.targetTitle || meta.targetId || 'Unknown'}`;
      if (!topItemsMap[itemKey]) {
        topItemsMap[itemKey] = {
          title: meta.targetTitle || meta.targetId || 'Unknown',
          type,
          count: 0,
        };
      }
      topItemsMap[itemKey].count += 1;
    }

    const topClicked = Object.values(topItemsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return {
      periodDays: days,
      totalClicks: clickEvents.length,
      clicksByType: byTargetType,
      topClickedItems: topClicked,
    };
  }
}

