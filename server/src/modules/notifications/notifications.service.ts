import { prisma } from '../../utils/prisma.js';
import { EmailService } from '../../utils/email.service.js';

export interface EnqueueJobOptions {
  type: string;
  payload: Record<string, any>;
  maxAttempts?: number;
  delaySeconds?: number;
}

export class NotificationsService {
  /**
   * Enqueue an async notification job into PostgreSQL.
   */
  static async enqueue(options: EnqueueJobOptions) {
    const nextAttemptAt = options.delaySeconds
      ? new Date(Date.now() + options.delaySeconds * 1000)
      : new Date();

    return prisma.notificationJob.create({
      data: {
        type: options.type,
        payload: options.payload,
        maxAttempts: options.maxAttempts || 3,
        nextAttemptAt,
        status: 'PENDING',
      },
    });
  }

  /**
   * Process a single job based on its type.
   */
  static async processJob(job: any): Promise<void> {
    const payload = job.payload as Record<string, any>;

    switch (job.type) {
      case 'STOCK_ALERT': {
        const { to, productName, size, productUrl, price } = payload;
        await EmailService.sendBackInStockEmail({
          to,
          productName,
          variantSize: size,
          productSlug: productUrl?.replace('/fragrance/', '') || 'fragrance',
          price: price || 2490,
        });
        break;
      }

      case 'ABANDONED_CART': {
        const { to, customerName, itemCount, recoveryUrl } = payload;
        await EmailService.sendGenericEmail({
          to,
          subject: `Complete your İLLURÊ order`,
          text: `Hello ${customerName || 'there'}, your selected items are saved in your cart. Visit ${recoveryUrl} to complete your order.`,
          html: `
            <div style="font-family: serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="letter-spacing: 2px;">İLLURÊ FRAGRANCE</h2>
              <p>We saved the ${itemCount} item(s) from your recent selection.</p>
              <p><a href="${recoveryUrl}" style="display: inline-block; background: #080A0B; color: #C7A866; padding: 12px 24px; text-decoration: none; font-size: 13px; letter-spacing: 1.5px;">RETURN TO CART &rarr;</a></p>
            </div>
          `,
        });
        break;
      }

      case 'REVIEW_REQUEST': {
        const { to, customerName, orderNumber, reviewUrl } = payload;
        await EmailService.sendGenericEmail({
          to,
          subject: `How is your experience with İLLURÊ?`,
          text: `Hello ${customerName || 'there'}, we hope you are enjoying your order #${orderNumber}. Share your feedback here: ${reviewUrl}`,
          html: `
            <div style="font-family: serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="letter-spacing: 2px;">İLLURÊ FRAGRANCE</h2>
              <p>We hope you are enjoying your recent acquisition (Order #${orderNumber}). We would appreciate your candid perspective.</p>
              <p><a href="${reviewUrl}" style="display: inline-block; background: #080A0B; color: #C7A866; padding: 12px 24px; text-decoration: none; font-size: 13px; letter-spacing: 1.5px;">SHARE YOUR REVIEW &rarr;</a></p>
            </div>
          `,
        });
        break;
      }

      default:
        console.warn(`[NotificationService] Unrecognized job type: ${job.type}`);
    }
  }

  /**
   * Drain pending jobs and process them with retry backoff.
   */
  static async drainQueue(batchSize: number = 20): Promise<{ processed: number; failed: number }> {
    const now = new Date();
    const jobs = await prisma.notificationJob.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        attempts: { lt: 3 },
        OR: [
          { nextAttemptAt: { lte: now } },
          { nextAttemptAt: null },
        ],
      },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    });

    let processed = 0;
    let failed = 0;

    for (const job of jobs) {
      await prisma.notificationJob.update({
        where: { id: job.id },
        data: { status: 'PROCESSING', attempts: { increment: 1 } },
      });

      try {
        await this.processJob(job);
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: {
            status: 'SENT',
            processedAt: new Date(),
            lastError: null,
          },
        });
        processed++;
      } catch (err: any) {
        failed++;
        const attempts = job.attempts + 1;
        const nextAttemptAt = new Date(Date.now() + Math.pow(2, attempts) * 30 * 1000);
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: {
            status: attempts >= job.maxAttempts ? 'FAILED' : 'PENDING',
            lastError: err?.message || String(err),
            nextAttemptAt,
          },
        });
      }
    }

    return { processed, failed };
  }

  /**
   * Query jobs for admin inspection.
   */
  static async listJobs(params: { status?: any; type?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;

    const [total, jobs] = await Promise.all([
      prisma.notificationJob.count({ where }),
      prisma.notificationJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retry a failed job manually.
   */
  static async retryJob(jobId: string) {
    return prisma.notificationJob.update({
      where: { id: jobId },
      data: {
        status: 'PENDING',
        attempts: 0,
        nextAttemptAt: new Date(),
        lastError: null,
      },
    });
  }
}
