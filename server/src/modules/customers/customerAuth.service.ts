import crypto from 'crypto';
import { prisma } from '../../utils/prisma.js';
import { hashPassword, verifyPassword } from '../../utils/password.utils.js';
import {
  generateCustomerAccessToken,
  generateRefreshTokenString,
  hashToken,
  getRefreshTokenExpiryDate,
} from '../../utils/jwt.utils.js';

export function normalizePhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('91')) {
    return clean.slice(2);
  }
  return clean;
}

export interface SessionMeta {
  ipAddress?: string;
  userAgent?: string;
}

export class CustomerAuthService {
  static async register(
    data: { name: string; email: string; phone: string; password: string },
    meta: SessionMeta
  ) {
    const emailNormalized = data.email.trim().toLowerCase();
    const phoneNormalized = normalizePhone(data.phone);

    const existingEmail = await prisma.customer.findUnique({
      where: { email: emailNormalized },
    });
    if (existingEmail) {
      throw { statusCode: 400, code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists.' };
    }

    const existingPhone = await prisma.customer.findFirst({
      where: { phone: phoneNormalized },
    });
    if (existingPhone) {
      throw { statusCode: 400, code: 'DUPLICATE_PHONE', message: 'An account with this phone number already exists.' };
    }

    const passwordHash = await hashPassword(data.password);

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: emailNormalized,
        phone: phoneNormalized,
        passwordHash,
      },
    });

    const accessToken = generateCustomerAccessToken({
      customerId: customer.id,
      email: customer.email,
      phone: customer.phone,
      name: customer.name,
    });

    const rawRefreshToken = generateRefreshTokenString();
    const refreshTokenHash = hashToken(rawRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        refreshTokenHash,
        expiresAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
      },
    };
  }

  static async login(
    data: { emailOrPhone: string; password: string },
    meta: SessionMeta
  ) {
    const input = data.emailOrPhone.trim();
    const cleanPhone = normalizePhone(input);
    const isEmail = input.includes('@');

    const customer = await prisma.customer.findFirst({
      where: isEmail
        ? { email: input.toLowerCase() }
        : { OR: [{ phone: cleanPhone }, { phone: input }] },
    });

    if (!customer || !customer.passwordHash) {
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password.' };
    }

    const isValidPassword = await verifyPassword(customer.passwordHash, data.password);
    if (!isValidPassword) {
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password.' };
    }

    if (!customer.isActive) {
      throw { statusCode: 403, code: 'ACCOUNT_DISABLED', message: 'Account is disabled.' };
    }

    const accessToken = generateCustomerAccessToken({
      customerId: customer.id,
      email: customer.email,
      phone: customer.phone,
      name: customer.name,
    });

    const rawRefreshToken = generateRefreshTokenString();
    const refreshTokenHash = hashToken(rawRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        refreshTokenHash,
        expiresAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
      },
    };
  }

  static async refresh(rawRefreshToken: string | undefined, meta: SessionMeta) {
    if (!rawRefreshToken) {
      throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Refresh token missing.' };
    }

    const refreshTokenHash = hashToken(rawRefreshToken);

    const session = await prisma.customerSession.findFirst({
      where: { refreshTokenHash },
      include: { customer: true },
    });

    if (!session) {
      throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token.' };
    }

    if (session.revokedAt) {
      // Security: Token reuse detected, revoke all sessions for customer
      await prisma.customerSession.updateMany({
        where: { customerId: session.customerId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw {
        statusCode: 401,
        code: 'TOKEN_REUSE_DETECTED',
        message: 'Security alert: Reused refresh token detected. All sessions invalidated.',
      };
    }

    if (session.expiresAt < new Date()) {
      throw { statusCode: 401, code: 'UNAUTHORIZED', message: 'Refresh token has expired.' };
    }

    if (!session.customer.isActive) {
      throw { statusCode: 403, code: 'ACCOUNT_DISABLED', message: 'Account is disabled.' };
    }

    // Revoke current session (Rotation)
    await prisma.customerSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    // Create new session
    const newRawRefreshToken = generateRefreshTokenString();
    const newRefreshTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.customerSession.create({
      data: {
        customerId: session.customerId,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    const accessToken = generateCustomerAccessToken({
      customerId: session.customer.id,
      email: session.customer.email,
      phone: session.customer.phone,
      name: session.customer.name,
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken,
      customer: {
        id: session.customer.id,
        name: session.customer.name,
        email: session.customer.email,
        phone: session.customer.phone,
        isActive: session.customer.isActive,
      },
    };
  }

  static async logout(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) return;
    const refreshTokenHash = hashToken(rawRefreshToken);
    await prisma.customerSession.updateMany({
      where: { refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static async getMe(customerId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!customer) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Customer profile not found.' };
    }

    if (!customer.isActive) {
      throw { statusCode: 403, code: 'ACCOUNT_DISABLED', message: 'Account is disabled.' };
    }

    return customer;
  }

  /**
   * Request password reset token and queue email
   */
  static async requestPasswordReset(email: string) {
    const customer = await prisma.customer.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // Timing-safe response: always return success message even if customer not found
    if (!customer || !customer.isActive) {
      return { message: 'If an account exists with this email, a reset link has been dispatched.' };
    }

    // Generate high-entropy reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: expiresAt,
      },
    });

    // Enqueue async email notification
    await prisma.notificationJob.create({
      data: {
        type: 'PASSWORD_RESET',
        payload: {
          recipient: customer.email,
          subject: 'İLLURÊ — Password Reset Request',
          name: customer.name,
          resetToken,
          resetLink: `${process.env.FRONTEND_URL || 'https://illure.77.37.45.177.sslip.io'}/account/reset-password?token=${resetToken}`,
        },
      },
    });

    return { message: 'If an account exists with this email, a reset link has been dispatched.' };
  }

  /**
   * Reset customer password using verified token
   */
  static async resetPassword(token: string, newPassword: string) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const customer = await prisma.customer.findFirst({
      where: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!customer) {
      throw { statusCode: 400, code: 'INVALID_TOKEN', message: 'Password reset link is invalid or has expired.' };
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Revoke all active customer sessions for security
    await prisma.customerSession.updateMany({
      where: { customerId: customer.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password updated successfully. You can now log in.' };
  }
}

