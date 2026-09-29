import { Response, NextFunction } from 'express';
import { CartService } from './cart.service.js';
import { sendSuccess } from '../../utils/response.utils.js';
import { CustomerAuthenticatedRequest } from '../../middleware/customerAuth.middleware.js';
import { env } from '../../config/env.js';

const CART_COOKIE_NAME = 'cart_session_key';

function getOrSetSessionKey(req: CustomerAuthenticatedRequest, res: Response): string | undefined {
  if (req.customer) return undefined;

  let sessionKey =
    (req.headers['x-cart-session'] as string) ||
    req.cookies?.[CART_COOKIE_NAME] ||
    (req.query?.sessionKey as string);

  if (!sessionKey) {
    sessionKey = CartService.generateSessionKey();
    const isProd = env.NODE_ENV === 'production';
    res.cookie(CART_COOKIE_NAME, sessionKey, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  return sessionKey;
}

export class CartController {
  static async getCart(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      const sessionKey = getOrSetSessionKey(req, res);

      const cart = await CartService.getCart(customerId, sessionKey);
      return sendSuccess(res, { cart, sessionKey: sessionKey || null });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      const sessionKey = getOrSetSessionKey(req, res);

      const cart = await CartService.addItem(customerId, sessionKey, req.body);
      return sendSuccess(res, { cart, sessionKey: sessionKey || null }, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      const sessionKey = getOrSetSessionKey(req, res);
      const itemId = req.params.itemId as string;

      const cart = await CartService.updateItem(customerId, sessionKey, itemId, req.body);
      return sendSuccess(res, { cart, sessionKey: sessionKey || null });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      const sessionKey = getOrSetSessionKey(req, res);
      const itemId = req.params.itemId as string;

      const cart = await CartService.removeItem(customerId, sessionKey, itemId);
      return sendSuccess(res, { cart, sessionKey: sessionKey || null });
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      const sessionKey = getOrSetSessionKey(req, res);

      const cart = await CartService.clearCart(customerId, sessionKey);
      return sendSuccess(res, { cart, sessionKey: sessionKey || null });
    } catch (error) {
      next(error);
    }
  }

  static async mergeCart(req: CustomerAuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customerId = req.customer?.id;
      if (!customerId) {
        throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Customer authentication required for cart merge.' };
      }

      const sessionKey = req.body.sessionKey || req.cookies?.[CART_COOKIE_NAME] || (req.headers['x-cart-session'] as string);

      const cart = await CartService.mergeCart(customerId, sessionKey);
      return sendSuccess(res, { cart });
    } catch (error) {
      next(error);
    }
  }
}
