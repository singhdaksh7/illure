import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AdminTokenPayload } from '../utils/jwt.utils.js';
import { prisma } from '../utils/prisma.js';
import { sendError } from '../utils/response.utils.js';
import { AdminRole } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    isActive: boolean;
  };
}

export async function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    let payload: AdminTokenPayload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      return sendError(res, 'Invalid or expired access token.', 401, 'UNAUTHORIZED');
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!admin) {
      return sendError(res, 'Admin user no longer exists.', 401, 'UNAUTHORIZED');
    }

    if (!admin.isActive) {
      return sendError(res, 'Admin account has been disabled.', 403, 'FORBIDDEN');
    }

    req.adminUser = admin;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdminRole(...allowedRoles: AdminRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return sendError(res, 'Authentication required.', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.adminUser.role)) {
      return sendError(
        res,
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
}
