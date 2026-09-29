import { Router, Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.utils.js';
import { env } from '../config/env.js';
import { prisma } from '../utils/prisma.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Verify DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return sendError(
      res,
      'Database connection failed during health check.',
      503,
      'SERVICE_UNAVAILABLE',
      {
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      }
    );
  }
});

export default router;
