import crypto from 'crypto';
import { env } from '../config/env.js';

// Derive 32-byte key from INTEGRATION_ENCRYPTION_KEY or fallback to SHA256 of JWT_ACCESS_SECRET
function getEncryptionKey(): Buffer {
  const secret = (process.env.INTEGRATION_ENCRYPTION_KEY || env.JWT_ACCESS_SECRET || 'illure-default-encryption-key-32chars!!');
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (hex encoded)
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 */
export function decryptSecret(cipherPayload: string): string {
  if (!cipherPayload) return '';
  const parts = cipherPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid cipher payload format.');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask secret string for safe API responses (e.g. "••••••••••••7890")
 */
export function maskSecret(secret?: string): string {
  if (!secret) return '';
  const str = String(secret);
  if (str.length <= 4) return '••••';
  const last4 = str.slice(-4);
  return '••••••••••••' + last4;
}
