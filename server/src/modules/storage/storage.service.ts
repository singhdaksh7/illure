import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '../../utils/prisma.js';
import { decryptSecret } from '../../utils/crypto.utils.js';

export interface UploadOptions {
  storageKey: string;
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  folder?: string;
  altText?: string;
}

export class StorageService {
  /**
   * Initialize or retrieve S3 client configured for Cloudflare R2
   */
  static async getClient(): Promise<{ client: S3Client | null; config: any | null }> {
    const integration = await prisma.integrationConfig.findUnique({
      where: { provider: 'R2' },
    });

    if (!integration || !integration.isEnabled || !integration.encryptedCredentials) {
      return { client: null, config: null };
    }

    try {
      const credentialsRaw = decryptSecret(integration.encryptedCredentials);
      const creds = JSON.parse(credentialsRaw);
      const settings = (integration.settings as Record<string, any>) || {};

      const accountId = creds.accountId || settings.accountId;
      const bucketName = creds.bucketName || settings.bucketName;
      const accessKeyId = creds.accessKeyId;
      const secretAccessKey = creds.secretAccessKey;
      const endpoint = settings.endpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
      const publicBaseUrl = settings.publicBaseUrl || `https://${bucketName}.r2.dev`;

      if (!accessKeyId || !secretAccessKey || !endpoint || !bucketName) {
        return { client: null, config: null };
      }

      const client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      return { client, config: { bucketName, publicBaseUrl, accountId } };
    } catch (err) {
      console.error('[StorageService] Failed to load R2 credentials:', err);
      return { client: null, config: null };
    }
  }

  /**
   * Upload file to R2 storage and record in media_items table
   */
  static async upload(options: UploadOptions): Promise<{ storageKey: string; publicUrl: string; id: string }> {
    const { client, config } = await this.getClient();

    if (!client || !config) {
      throw {
        statusCode: 400,
        code: 'R2_STORAGE_CONFIGURATION_REQUIRED',
        message: 'R2 STORAGE CONFIGURATION REQUIRED. Please configure Cloudflare R2 credentials in the Integrations Vault before uploading media.',
      };
    }

    // Put Object in Cloudflare R2
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: options.storageKey,
        Body: options.buffer,
        ContentType: options.mimeType,
      })
    );

    const publicUrl = `${config.publicBaseUrl.replace(/\/$/, '')}/${options.storageKey}`;

    const media = await prisma.mediaItem.create({
      data: {
        storageKey: options.storageKey,
        publicUrl,
        fileName: options.fileName,
        mimeType: options.mimeType,
        fileSize: options.buffer.length,
        folder: options.folder || 'general',
        altText: options.altText || null,
      },
    });

    return { storageKey: options.storageKey, publicUrl, id: media.id };
  }

  /**
   * Generate short-lived pre-signed URL for direct browser-to-R2 upload
   */
  static async getSignedUploadUrl(storageKey: string, mimeType: string, expiresInSeconds = 300) {
    const { client, config } = await this.getClient();
    if (!client || !config) {
      throw { statusCode: 400, code: 'R2_NOT_CONFIGURED', message: 'Cloudflare R2 storage is not configured or disabled.' };
    }

    const command = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: storageKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    const publicUrl = `${config.publicBaseUrl.replace(/\/$/, '')}/${storageKey}`;

    return { uploadUrl, publicUrl, storageKey };
  }

  /**
   * Delete an object from R2 and remove media library record
   */
  static async delete(storageKey: string, force = false): Promise<boolean> {
    const media = await prisma.mediaItem.findUnique({
      where: { storageKey },
    });

    if (media && media.usedByCount > 0 && !force) {
      throw {
        statusCode: 400,
        code: 'MEDIA_IN_USE',
        message: `This image is actively referenced in ${media.usedByCount} location(s). Confirm force deletion to proceed.`,
      };
    }

    const { client, config } = await this.getClient();
    if (client && config) {
      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: config.bucketName,
            Key: storageKey,
          })
        );
      } catch (err) {
        console.warn(`[StorageService] R2 delete error for ${storageKey}:`, err);
      }
    }

    if (media) {
      await prisma.mediaItem.delete({ where: { storageKey } });
    }

    return true;
  }

  /**
   * Test connection to R2 bucket
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const { client, config } = await this.getClient();
    if (!client || !config) {
      return { success: false, message: 'Cloudflare R2 integration is not configured or credentials are missing.' };
    }

    try {
      await client.send(
        new HeadObjectCommand({
          Bucket: config.bucketName,
          Key: 'probe-connection-test.txt',
        })
      ).catch((err) => {
        if (err?.name === 'NotFound' || err?.$metadata?.httpStatusCode === 404) {
          return true;
        }
        throw err;
      });

      return { success: true, message: `Successfully connected to Cloudflare R2 bucket: ${config.bucketName}` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to authenticate with Cloudflare R2 bucket.' };
    }
  }

  /**
   * Media Library Query
   */
  static async listMedia(params: { folder?: string; search?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 24;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.folder && params.folder !== 'all') {
      where.folder = params.folder;
    }
    if (params.search) {
      where.OR = [
        { fileName: { contains: params.search, mode: 'insensitive' } },
        { altText: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.mediaItem.count({ where }),
      prisma.mediaItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
