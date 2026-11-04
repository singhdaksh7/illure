import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.utils.js';
import { AdminRole } from '@prisma/client';

describe('CMS & Visual Customization API', () => {
  const adminEmail = 'cmsadmin@illurefragrance.com';
  const adminPassword = 'AdminPassword@2026!';
  let adminToken: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.adminUser.deleteMany({ where: { email: adminEmail } });
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'CMS Test Admin',
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });

    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: adminEmail, password: adminPassword });

    adminToken = loginRes.body.data.accessToken;
  });

  it('GET /api/cms - should return public sections and site settings', async () => {
    const res = await request(app).get('/api/cms');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.sections)).toBe(true);
    expect(res.body.data.sections.length).toBeGreaterThan(0);
    expect(res.body.data.settings).toBeDefined();
    expect(res.body.data.settings.appearance).toBeDefined();
    expect(res.body.data.settings.announcement).toBeDefined();
  });

  it('GET /api/admin/cms/sections - should require authentication', async () => {
    const res = await request(app).get('/api/admin/cms/sections');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/cms/sections - should return all sections for admin', async () => {
    const res = await request(app)
      .get('/api/admin/cms/sections')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.sections)).toBe(true);
  });

  it('PATCH /api/admin/cms/sections/:id - should update section layout and title', async () => {
    const listRes = await request(app)
      .get('/api/admin/cms/sections')
      .set('Authorization', `Bearer ${adminToken}`);

    const targetSection = listRes.body.data.sections[0];

    const patchRes = await request(app)
      .patch(`/api/admin/cms/sections/${targetSection.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Updated Headline Test',
        layoutVariant: 'EDITORIAL',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.section.title).toBe('Updated Headline Test');
    expect(patchRes.body.data.section.layoutVariant).toBe('EDITORIAL');
  });

  it('PATCH /api/admin/cms/settings/:key - should update setting value', async () => {
    const patchRes = await request(app)
      .patch('/api/admin/cms/settings/announcement')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        value: {
          isEnabled: true,
          text: 'Private Exhibition Live — Complimentary Extrait Sample',
          linkUrl: '#catalog',
          theme: 'gold_subtle',
        },
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);

    const publicRes = await request(app).get('/api/cms');
    expect(publicRes.body.data.settings.announcement.text).toBe('Private Exhibition Live — Complimentary Extrait Sample');
  });

  it('RBAC - INVENTORY_MANAGER should be forbidden from modifying CMS settings (403)', async () => {
    const invEmail = 'invcms@illurefragrance.com';
    const invPassword = 'InventoryPassword@2026!';
    const passwordHash = await hashPassword(invPassword);

    await prisma.adminUser.deleteMany({ where: { email: invEmail } });
    await prisma.adminUser.create({
      data: {
        email: invEmail,
        passwordHash,
        name: 'Inventory Staff',
        role: AdminRole.INVENTORY_MANAGER,
        isActive: true,
      },
    });

    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: invEmail, password: invPassword });

    const invToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .patch('/api/admin/cms/settings/announcement')
      .set('Authorization', `Bearer ${invToken}`)
      .send({
        value: { text: 'Unauthorized CMS override attempt' },
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('VALIDATION - should reject invalid appearance hex color codes (400)', async () => {
    const res = await request(app)
      .patch('/api/admin/cms/settings/appearance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        value: {
          primaryBg: 'not-a-valid-hex-color',
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('INVALID_HEX_COLOR');
  });

  it('VALIDATION - should reject invalid borderRadius option (400)', async () => {
    const res = await request(app)
      .patch('/api/admin/cms/settings/appearance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        value: {
          borderRadius: 'hyper-circular-extreme',
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('INVALID_BORDER_RADIUS');
  });

  it('VALIDATION - should reject out-of-bounds hero overlay strength (400)', async () => {
    const listRes = await request(app)
      .get('/api/admin/cms/sections')
      .set('Authorization', `Bearer ${adminToken}`);

    const targetSection = listRes.body.data.sections[0];

    const res = await request(app)
      .patch(`/api/admin/cms/sections/${targetSection.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customData: {
          overlayStrength: 5.5, // out of 0.1 - 0.95 range
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('INVALID_OVERLAY_STRENGTH');
  });

  it('VALIDATION - should reject dangerous URL schemes like javascript: (400)', async () => {
    const listRes = await request(app)
      .get('/api/admin/cms/sections')
      .set('Authorization', `Bearer ${adminToken}`);

    const targetSection = listRes.body.data.sections[0];

    const res = await request(app)
      .patch(`/api/admin/cms/sections/${targetSection.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ctaUrl: 'javascript:alert("exploit")',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error?.code).toBe('INVALID_URL');
  });
});

