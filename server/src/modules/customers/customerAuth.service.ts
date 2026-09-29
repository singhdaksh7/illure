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
}
