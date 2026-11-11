import { prisma } from '../../utils/prisma.js';

export class AnalyticsService {
  /**
   * Get commerce executive dashboard statistics across a time range.
   */
  static async getExecutiveMetrics(days: number = 30) {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orders, customersCount, lowStockVariants, wishlistCount, pendingReturns] = await Promise.all([
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
    ]);

    const totalOrders = orders.length;
    let totalRevenue = 0;
    let prepaidOrders = 0;
    let codOrders = 0;
    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const ord of orders) {
      const amt = Number(ord.totalAmount);
      totalRevenue += amt;

      if (ord.paymentStatus === 'PAID') prepaidOrders++;
      else codOrders++;

      for (const item of ord.items) {
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
      },
      bestsellers,
    };
  }

  /**
   * Export orders in CSV format.
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
      const name = `"${(o.customerName || '').replace(/"/g, '""')}"`;
      const email = `"${(o.customerEmail || '').replace(/"/g, '""')}"`;
      const city = `"${(o.shippingAddress?.city || '').replace(/"/g, '""')}"`;
      const state = `"${(o.shippingAddress?.state || '').replace(/"/g, '""')}"`;
      return `${o.orderNumber},${date},${name},${o.customerPhone},${email},${o.status},${o.paymentStatus},${o.totalAmount},${city},${state}`;
    });

    return header + rows.join('\n');
  }
}
