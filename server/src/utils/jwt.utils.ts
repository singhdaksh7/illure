import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AdminRole } from '@prisma/client';

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: AdminRole;
}

export function generateAccessToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AdminTokenPayload;
}

export function generateRefreshTokenString(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiryDate(): Date {
  // Parse TTL string like "7d" or default 7 days
  const ttl = env.REFRESH_TOKEN_TTL;
  let days = 7;
  if (ttl.endsWith('d')) {
    days = parseInt(ttl.replace('d', ''), 10) || 7;
  }
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
