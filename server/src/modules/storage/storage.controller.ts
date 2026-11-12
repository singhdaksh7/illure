import { Request, Response, NextFunction } from 'express';
import { StorageService } from './storage.service.js';

export class StorageController {
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = (req as any).file;
      const { folder, altText } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: { code: 'FILE_REQUIRED', message: 'No file uploaded.' },
        });
      }

      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageKey = `${folder || 'general'}/${timestamp}-${sanitizedName}`;

      const result = await StorageService.upload({
        storageKey,
        buffer: file.buffer,
        mimeType: file.mimetype,
        fileName: file.originalname,
        folder: folder || 'general',
        altText,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getPresignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, mimeType, folder } = req.body;
      if (!fileName || !mimeType) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'fileName and mimeType are required.' },
        });
      }

      const timestamp = Date.now();
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageKey = `${folder || 'general'}/${timestamp}-${sanitizedName}`;

      const result = await StorageService.getSignedUploadUrl(storageKey, mimeType);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async listMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { folder, search, page, limit } = req.query;
      const result = await StorageService.listMedia({
        folder: folder as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 24,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const storageKey = String(req.params.storageKey);
      const force = req.query.force === 'true';

      await StorageService.delete(storageKey, force);

      return res.status(200).json({
        success: true,
        message: 'Media deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  static async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await StorageService.testConnection();
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
