import { env } from '../config/env.js';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(sanitizeMeta(meta))}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
}

function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'authorization', 'secret'];

  for (const [key, value] of Object.entries(meta)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMeta(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(formatLog('info', message, meta));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(formatLog('warn', message, meta));
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(formatLog('error', message, meta));
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (env.NODE_ENV !== 'production' || env.LOG_LEVEL === 'debug') {
      console.debug(formatLog('debug', message, meta));
    }
  },
};
