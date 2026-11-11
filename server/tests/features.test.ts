import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';
import { hashPassword } from '../src/utils/password.utils.js';

describe('Commerce Features Architecture (Phase 1)', () => {
  let superAdminToken: string;
  let inventoryManagerToken: string;

  beforeAll(async () => {
    // Clean up feature audit logs and features
    await prisma.commerceAuditLog.deleteMany({});
    await prisma.commerceEventLog.deleteMany({});
    await prisma.commerceFeature.deleteMany({});

    // Create Super Admin
    const superAdminPasswordHash = await hashPassword('SuperAdmin123!');
    const superAdmin = await prisma.adminUser.upsert({
      where: { email: 'superfeat@illure.com' },
      update: {},
      create: {
        email: 'superfeat@illure.com',
        name: 'Super Admin Feat',
        passwordHash: superAdminPasswordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    const superRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'superfeat@illure.com', password: 'SuperAdmin123!' });
    superAdminToken = superRes.body.data.accessToken;

    // Create Inventory Manager (Restricted role)
    const invPasswordHash = await hashPassword('InvManager123!');
    const invUser = await prisma.adminUser.upsert({
      where: { email: 'invfeat@illure.com' },
      update: {},
      create: {
        email: 'invfeat@illure.com',
        name: 'Inv Manager Feat',
        passwordHash: invPasswordHash,
        role: 'INVENTORY_MANAGER',
        isActive: true,
      },
    });

    const invRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'invfeat@illure.com', password: 'InvManager123!' });
    inventoryManagerToken = invRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.adminUser.deleteMany({
      where: { email: { in: ['superfeat@illure.com', 'invfeat@illure.com'] } },
    });
  });

  it('GET /api/features - public should auto-seed and return active features map', async () => {
    const res = await request(app).get('/api/features');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.features).toBeDefined();
    expect(Array.isArray(res.body.data.features)).toBe(true);
    expect(res.body.data.featureMap).toBeDefined();
    expect(res.body.data.featureMap['scent_finder']).toBe(true);
    // Disabled feature should NOT be true in public featureMap
    expect(res.body.data.featureMap['discovery_set']).toBeUndefined();
  });

  it('GET /api/admin/features - should require admin auth and return all categorized features', async () => {
    const unauthRes = await request(app).get('/api/admin/features');
    expect(unauthRes.status).toBe(401);

    const res = await request(app)
      .get('/api/admin/features')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.total).toBeGreaterThanOrEqual(30);
    expect(res.body.data.features.length).toBeGreaterThanOrEqual(30);
  });

  it('RBAC - INVENTORY_MANAGER cannot modify feature flags (403)', async () => {
    const res = await request(app)
      .patch('/api/admin/features/scent_finder')
      .set('Authorization', `Bearer ${inventoryManagerToken}`)
      .send({ isEnabled: false });

    expect(res.status).toBe(403);
  });

  it('PATCH /api/admin/features/:key - SUPER_ADMIN can toggle feature and creates audit log', async () => {
    const updateRes = await request(app)
      .patch('/api/admin/features/scent_finder')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ isEnabled: false });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.feature.isEnabled).toBe(false);

    // Verify public endpoint reflects change
    const pubRes = await request(app).get('/api/features');
    expect(pubRes.body.data.featureMap['scent_finder']).toBeUndefined();

    // Verify single feature endpoint shows audit log
    const getRes = await request(app)
      .get('/api/admin/features/scent_finder')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.feature.auditLogs.length).toBeGreaterThanOrEqual(1);
    expect(getRes.body.data.feature.auditLogs[0].action).toBe('TOGGLE_ENABLED');

    // Restore feature
    const restoreRes = await request(app)
      .patch('/api/admin/features/scent_finder')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ isEnabled: true });

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.data.feature.isEnabled).toBe(true);
  });

  it('POST /api/features/track-event - should log public analytics events safely', async () => {
    const res = await request(app)
      .post('/api/features/track-event')
      .send({
        eventType: 'SCENT_FINDER_STARTED',
        featureKey: 'scent_finder',
        sessionId: 'sess_123',
        metadata: { source: 'homepage_banner' },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.tracked).toBe(true);

    const log = await prisma.commerceEventLog.findFirst({
      where: { eventType: 'SCENT_FINDER_STARTED' },
    });
    expect(log).toBeDefined();
    expect(log?.featureKey).toBe('scent_finder');
  });
});
