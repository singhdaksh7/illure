import { prisma } from '../../utils/prisma.js';
import { encryptSecret, decryptSecret, maskSecret } from '../../utils/crypto.utils.js';
import { StorageService } from '../storage/storage.service.js';
import { IntegrationProvider } from '@prisma/client';
import nodemailer from 'nodemailer';

export interface SaveIntegrationInput {
  provider: string; // 'R2' | 'SHIPROCKET' | 'RAZORPAY' | 'SMTP'
  isEnabled?: boolean;
  credentials?: Record<string, string>; // Unencrypted input from admin
  settings?: Record<string, any>;
}

export class IntegrationsService {
  /**
   * List all integrations with masked credentials
   */
  static async listIntegrations(isSuperAdmin = true) {
    const integrations = await prisma.integrationConfig.findMany({
      orderBy: { provider: 'asc' },
    });

    const knownProviders = ['R2', 'SHIPROCKET', 'RAZORPAY', 'SMTP'];

    // Map existing records
    const map = new Map<string, any>();
    for (const item of integrations) {
      let maskedCreds: Record<string, string> = {};
      if (item.encryptedCredentials && isSuperAdmin) {
        try {
          const raw = decryptSecret(item.encryptedCredentials);
          const parsed = JSON.parse(raw);
          for (const [k, v] of Object.entries(parsed)) {
            maskedCreds[k] = maskSecret(String(v));
          }
        } catch {
          maskedCreds = { status: 'DECRYPTION_ERROR' };
        }
      } else if (item.encryptedCredentials) {
        maskedCreds = { status: 'CONFIGURED' };
      }

      map.set(item.provider, {
        id: item.id,
        provider: item.provider,
        isEnabled: item.isEnabled,
        settings: isSuperAdmin ? item.settings : {},
        maskedCredentials: maskedCreds,
        hasCredentials: !!item.encryptedCredentials,
        lastTestedAt: item.lastTestedAt,
        testStatus: item.lastTestStatus || 'UNKNOWN',
        testMessage: item.lastTestMessage || null,
      });
    }

    // Include unconfigured defaults
    return knownProviders.map((prov) => {
      if (map.has(prov)) {
        return map.get(prov);
      }
      return {
        id: null,
        provider: prov,
        isEnabled: false,
        settings: {},
        maskedCredentials: {},
        hasCredentials: false,
        lastTestedAt: null,
        testStatus: 'CONFIGURATION_REQUIRED',
        testMessage: 'Integration not yet configured.',
      };
    });
  }

  /**
   * Save or update integration credentials & settings
   */
  static async saveIntegration(input: SaveIntegrationInput) {
    const provider = input.provider.toUpperCase() as IntegrationProvider;

    const existing = await prisma.integrationConfig.findUnique({
      where: { provider },
    });

    let encryptedCredentials = existing?.encryptedCredentials || '';

    if (input.credentials && Object.keys(input.credentials).length > 0) {
      // Merge with existing decrypted credentials if partial update
      let currentCreds: Record<string, string> = {};
      if (existing?.encryptedCredentials) {
        try {
          currentCreds = JSON.parse(decryptSecret(existing.encryptedCredentials));
        } catch {}
      }

      // Only update fields that were actually passed and not masked placeholders
      for (const [key, value] of Object.entries(input.credentials)) {
        if (value && !value.includes('••••')) {
          currentCreds[key] = value;
        }
      }

      encryptedCredentials = encryptSecret(JSON.stringify(currentCreds));
    }

    const mergedSettings = {
      ...((existing?.settings as Record<string, any>) || {}),
      ...(input.settings || {}),
    };

    const saved = await prisma.integrationConfig.upsert({
      where: { provider },
      create: {
        provider,
        isEnabled: input.isEnabled ?? true,
        encryptedCredentials: encryptedCredentials || encryptSecret('{}'),
        settings: mergedSettings,
      },
      update: {
        ...(input.isEnabled !== undefined ? { isEnabled: input.isEnabled } : {}),
        ...(encryptedCredentials ? { encryptedCredentials } : {}),
        settings: mergedSettings,
      },
    });

    return {
      id: saved.id,
      provider: saved.provider,
      isEnabled: saved.isEnabled,
      hasCredentials: !!saved.encryptedCredentials,
    };
  }

  /**
   * Retrieve decrypted credentials for internal server modules
   */
  static async getDecryptedCredentials(providerName: string): Promise<{
    credentials: Record<string, any>;
    settings: Record<string, any>;
    isEnabled: boolean;
  } | null> {
    const provider = providerName.toUpperCase() as IntegrationProvider;
    const item = await prisma.integrationConfig.findUnique({
      where: { provider },
    });

    if (!item) return null;

    let credentials: Record<string, any> = {};
    if (item.encryptedCredentials) {
      try {
        credentials = JSON.parse(decryptSecret(item.encryptedCredentials));
      } catch (err) {
        console.error(`[IntegrationsService] Failed to decrypt ${provider} credentials:`, err);
      }
    }

    return {
      credentials,
      settings: (item.settings as Record<string, any>) || {},
      isEnabled: item.isEnabled,
    };
  }

  /**
   * Test connection to provider
   */
  static async testIntegration(providerName: string): Promise<{ success: boolean; status: string; message: string }> {
    const provider = providerName.toUpperCase() as IntegrationProvider;
    const config = await prisma.integrationConfig.findUnique({ where: { provider } });

    if (!config || !config.encryptedCredentials) {
      const result = {
        success: false,
        status: 'CONFIGURATION_REQUIRED',
        message: `${provider} credentials are missing. Configuration required.`,
      };
      if (config) {
        await prisma.integrationConfig.update({
          where: { provider },
          data: { lastTestStatus: result.status, lastTestMessage: result.message, lastTestedAt: new Date() },
        });
      }
      return result;
    }

    let result = { success: false, status: 'ERROR', message: 'Test failed.' };

    try {
      if (provider === 'R2') {
        const testRes = await StorageService.testConnection();
        result = {
          success: testRes.success,
          status: testRes.success ? 'CONNECTED' : 'FAILED',
          message: testRes.message,
        };
      } else if (provider === 'SHIPROCKET') {
        const creds = JSON.parse(decryptSecret(config.encryptedCredentials));
        if (!creds.email || !creds.password) {
          result = { success: false, status: 'CONFIGURATION_REQUIRED', message: 'Shiprocket email and password are required.' };
        } else {
          const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: creds.email, password: creds.password }),
          });
          const authData: any = await authRes.json();
          if (authRes.ok && authData?.token) {
            result = { success: true, status: 'CONNECTED', message: 'Shiprocket authentication successful.' };
          } else {
            result = { success: false, status: 'FAILED', message: authData?.message || 'Shiprocket authentication failed.' };
          }
        }
      } else if (provider === 'RAZORPAY') {
        const creds = JSON.parse(decryptSecret(config.encryptedCredentials));
        if (!creds.keyId || !creds.keySecret) {
          result = { success: false, status: 'CONFIGURATION_REQUIRED', message: 'Razorpay Key ID and Secret are required.' };
        } else {
          const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
          const rzpRes = await fetch('https://api.razorpay.com/v1/orders?count=1', {
            headers: { Authorization: `Basic ${auth}` },
          });
          if (rzpRes.ok) {
            result = { success: true, status: 'CONNECTED', message: 'Razorpay API credentials verified successfully.' };
          } else {
            result = { success: false, status: 'FAILED', message: 'Razorpay authorization failed. Check Key ID & Secret.' };
          }
        }
      } else if (provider === 'SMTP') {
        const creds = JSON.parse(decryptSecret(config.encryptedCredentials));
        const settings = (config.settings as Record<string, any>) || {};
        const transporter = nodemailer.createTransport({
          host: settings.host || creds.host,
          port: Number(settings.port || creds.port || 587),
          secure: Number(settings.port || creds.port) === 465,
          auth: {
            user: creds.user || creds.email,
            pass: creds.pass || creds.password,
          },
        });
        await transporter.verify();
        result = { success: true, status: 'CONNECTED', message: 'SMTP connection established and verified.' };
      } else {
        result = { success: false, status: 'UNSUPPORTED', message: `Unknown provider ${provider}` };
      }
    } catch (err: any) {
      result = {
        success: false,
        status: 'FAILED',
        message: err?.message || 'Connection test encountered an error.',
      };
    }

    // Update integration status in DB
    await prisma.integrationConfig.update({
      where: { provider },
      data: {
        lastTestStatus: result.status,
        lastTestMessage: result.message,
        lastTestedAt: new Date(),
      },
    });

    return result;
  }
}
