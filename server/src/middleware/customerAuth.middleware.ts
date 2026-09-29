import { Request, Response, NextFunction } from 'express';
import { verifyCustomerAccessToken, CustomerTokenPayload } from '../utils/jwt.utils.js';
import { prisma } from '../utils/prisma.js';
import { sendError } from '../utils/response.utils.js';

export interface CustomerAuthenticatedRequest extends Request {
  customer?: {
    id: string;
    email: string | null;
    phone: string;
    name: string;
    isActive: boolean;
  };
}

export async function requireCustomerAuth(
  req: CustomerAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    let payload: CustomerTokenPayload;
    try {
      payload = verifyCustomerAccessToken(token);
    } catch {
      return sendError(res, 'Invalid or expired access token.', 401, 'UNAUTHORIZED');
    }

    const customer = await prisma.customer.findUnique({
      where: { id: payload.customerId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        isActive: true,
      },
    });

    if (!customer) {
      return sendError(res, 'Customer account no longer exists.', 401, 'UNAUTHORIZED');
    }

    if (!customer.isActive) {
      return sendError(res, 'Account is disabled.', 403, 'FORBIDDEN');
    }

    req.customer = customer;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalCustomerAuth(
  req: CustomerAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = verifyCustomerAccessToken(token);
        const customer = await prisma.customer.findUnique({
          where: { id: payload.customerId },
          select: {
            id: true,
            email: true,
            phone: true,
            name: true,
            isActive: true,
          },
        });
        if (customer && customer.isActive) {
          req.customer = customer;
        }
      } catch {
        // Ignore invalid token in optional auth
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}
