import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  messageOrStatusCode?: string | number,
  statusCode = 200
): Response {
  let message: string | undefined;
  let code = statusCode;

  if (typeof messageOrStatusCode === 'number') {
    code = messageOrStatusCode;
  } else if (typeof messageOrStatusCode === 'string') {
    message = messageOrStatusCode;
  }

  const response: ApiResponse<T> = {
    success: true,
    ...(message ? { message } : {}),
    data,
  };
  return res.status(code).json(response);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  code = 'BAD_REQUEST',
  details?: unknown
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(response);
}
