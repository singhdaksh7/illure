import { Request, Response, NextFunction } from 'express';
import { CustomerAuthService } from './customerAuth.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { CustomerAuthenticatedRequest } from '../../middleware/customerAuth.middleware.js';
import { env } from '../../config/env.js';

const REFRESH_COOKIE_NAME = 'customer_refresh_token';

function setCustomerRefreshCookie(res: Response, token: string) {
  const isProd = env.NODE_ENV === 'production';
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

function clearCustomerRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

export class CustomerAuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await CustomerAuthService.register(req.body, { ipAddress, userAgent });

      setCustomerRefreshCookie(res, result.refreshToken);

      return sendSuccess(res, {
        accessToken: result.accessToken,
        customer: result.customer,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await CustomerAuthService.login(req.body, { ipAddress, userAgent });

      setCustomerRefreshCookie(res, result.refreshToken);

      return sendSuccess(res, {
        accessToken: result.accessToken,
        customer: result.customer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await CustomerAuthService.refresh(rawRefreshToken, { ipAddress, userAgent });

      setCustomerRefreshCookie(res, result.refreshToken);

      return sendSuccess(res, {
        accessToken: result.accessToken,
        customer: result.customer,
      });
    } catch (error) {
      clearCustomerRefreshCookie(res);
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      if (rawRefreshToken) {
        await CustomerAuthService.logout(rawRefreshToken);
      }
      clearCustomerRefreshCookie(res);
      return sendSuccess(res, { message: 'Successfully logged out.' });
    } catch (error) {
      clearCustomerRefreshCookie(res);
      next(error);
    }
  }

  static async me(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.customer) {
        throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Not authenticated.' };
      }
      const customer = await CustomerAuthService.getMe(req.customer.id);
      return sendSuccess(res, { customer });
    } catch (error) {
      next(error);
    }
  }
}
