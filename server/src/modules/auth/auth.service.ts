import { prisma } from '../../utils/prisma.js';
import { verifyPassword } from '../../utils/password.utils.js';
import {
  generateAccessToken,
  generateRefreshTokenString,
  hashToken,
  getRefreshTokenExpiryDate,
} from '../../utils/jwt.utils.js';
import { LoginInput } from './auth.validation.js';

export class AuthService {
  static async login(
    input: LoginInput,
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic error to prevent email enumeration
    if (!admin) {
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
    }

    if (!admin.isActive) {
      throw { statusCode: 403, code: 'ACCOUNT_DISABLED', message: 'Account is disabled.' };
    }

    const isPasswordValid = await verifyPassword(admin.passwordHash, input.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' };
    }

    // Update last login timestamp
    const now = new Date();
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: now },
    });

    // Generate JWT access token
    const accessToken = generateAccessToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Generate & hash refresh token
    const rawRefreshToken = generateRefreshTokenString();
    const refreshTokenHash = hashToken(rawRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.adminSession.create({
      data: {
        adminUserId: admin.id,
        refreshTokenHash,
        expiresAt,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        lastLoginAt: now,
      },
    };
  }

  static async refresh(
    rawRefreshToken: string,
    meta?: { ipAddress?: string; userAgent?: string }
  ) {
    if (!rawRefreshToken) {
      throw { statusCode: 401, code: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token is required.' };
    }

    const tokenHash = hashToken(rawRefreshToken);

    const session = await prisma.adminSession.findFirst({
      where: { refreshTokenHash: tokenHash },
      include: { adminUser: true },
    });

    // Security Detection: If token session was already revoked, someone may be attempting token reuse!
    if (session && session.revokedAt !== null) {
      // Invalidate all active sessions for this compromised admin account
      await prisma.adminSession.updateMany({
        where: { adminUserId: session.adminUserId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw {
        statusCode: 401,
        code: 'TOKEN_REUSE_DETECTED',
        message: 'Security alert: Reused refresh token detected. All sessions invalidated.',
      };
    }

    if (!session || session.expiresAt < new Date()) {
      throw { statusCode: 401, code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token.' };
    }

    if (!session.adminUser.isActive) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw { statusCode: 403, code: 'ACCOUNT_DISABLED', message: 'Account is disabled.' };
    }

    // Refresh Token Rotation: Revoke previous session
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    // Create replacement refresh token & session
    const newRawRefreshToken = generateRefreshTokenString();
    const newRefreshTokenHash = hashToken(newRawRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.adminSession.create({
      data: {
        adminUserId: session.adminUserId,
        refreshTokenHash: newRefreshTokenHash,
        expiresAt,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      },
    });

    // Issue new access token
    const newAccessToken = generateAccessToken({
      adminId: session.adminUser.id,
      email: session.adminUser.email,
      role: session.adminUser.role,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
      admin: {
        id: session.adminUser.id,
        email: session.adminUser.email,
        name: session.adminUser.name,
        role: session.adminUser.role,
      },
    };
  }

  static async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;

    const tokenHash = hashToken(rawRefreshToken);
    await prisma.adminSession.updateMany({
      where: { refreshTokenHash: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static async getMe(adminId: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'Admin user not found.' };
    }

    return admin;
  }
}
