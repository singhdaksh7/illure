import { Router } from 'express';
import multer from 'multer';
import { StorageController } from './storage.controller.js';
import { requireAdminAuth, requireAdminRole } from '../../middleware/auth.middleware.js';
import { AdminRole } from '@prisma/client';

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP, GIF, and SVG images are allowed.'));
    }
  },
});

const router = Router();

// Storage / Media Library Admin Routes
router.post(
  '/admin/storage/upload',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  upload.single('file'),
  StorageController.upload
);

router.post(
  '/admin/storage/presigned-url',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  StorageController.getPresignedUrl
);

router.get(
  '/admin/storage/media',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.INVENTORY_MANAGER),
  StorageController.listMedia
);

router.delete(
  '/admin/storage/media/:storageKey(*)',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN),
  StorageController.deleteMedia
);

router.post(
  '/admin/storage/test-connection',
  requireAdminAuth,
  requireAdminRole(AdminRole.SUPER_ADMIN),
  StorageController.testConnection
);

export default router;
