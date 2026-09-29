import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  logger.error('Unhandled Server Error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || err.status || 500;
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal Server Error';

  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  return sendError(res, message, statusCode, code);
}
