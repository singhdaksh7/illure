import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { env } from '../../config/env.js';

const REFRESH_COOKIE_NAME = 'admin_refresh_token';

function setRefreshCookie(res: Response, token: string) {
  const isProd = env.NODE_ENV === 'production';
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.login(req.body, { ipAddress, userAgent });

      setRefreshCookie(res, result.refreshToken);

      return sendSuccess(res, {
        accessToken: result.accessToken,
        admin: result.admin,
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

      const result = await AuthService.refresh(rawRefreshToken, { ipAddress, userAgent });

      setRefreshCookie(res, result.refreshToken);

      return sendSuccess(res, {
        accessToken: result.accessToken,
        admin: result.admin,
      });
    } catch (error) {
      clearRefreshCookie(res);
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
      if (rawRefreshToken) {
        await AuthService.logout(rawRefreshToken);
      }
      clearRefreshCookie(res);
      return sendSuccess(res, { message: 'Successfully logged out.' });
    } catch (error) {
      clearRefreshCookie(res);
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.adminUser) {
        throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Not authenticated.' };
      }
      const admin = await AuthService.getMe(req.adminUser.id);
      return sendSuccess(res, { admin });
    } catch (error) {
      next(error);
    }
  }
}
