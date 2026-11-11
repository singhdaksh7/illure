import { prisma } from '../../utils/prisma.js';
import { INITIAL_COMMERCE_FEATURES } from './features.defaults.js';
import { FeatureGroup, FeatureStatus, AdminRole } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  code: string;
  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class FeaturesService {
  /**
   * Seed default commerce features idempotently without overwriting admin modifications
   */
  static async seedDefaults(): Promise<number> {
    let seeded = 0;
    for (const feat of INITIAL_COMMERCE_FEATURES) {
      const existing = await prisma.commerceFeature.findUnique({
        where: { key: feat.key },
      });
      if (!existing) {
        await prisma.commerceFeature.create({
          data: {
            key: feat.key,
            name: feat.name,
            description: feat.description,
            group: feat.group,
            isEnabled: feat.isEnabled,
            status: feat.status,
            showInNavigation: feat.showInNavigation,
            navigationLabel: feat.navigationLabel,
            navigationPath: feat.navigationPath,
            showOnHomepage: feat.showOnHomepage,
            homepageSortOrder: feat.homepageSortOrder,
            config: feat.config,
            sortOrder: feat.sortOrder,
          },
        });
        seeded++;
      }
    }
    return seeded;
  }

  /**
   * Public view of enabled features for storefront hydration
   */
  static async getPublicFeatures() {
    await this.ensureSeeded();

    const features = await prisma.commerceFeature.findMany({
      where: {
        isEnabled: true,
        status: FeatureStatus.ACTIVE,
      },
      select: {
        key: true,
        name: true,
        group: true,
        isEnabled: true,
        showInNavigation: true,
        navigationLabel: true,
        navigationPath: true,
        showOnHomepage: true,
        homepageSortOrder: true,
        config: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Transform into a quick key-lookup map + list
    const featureMap: Record<string, boolean> = {};
    const configMap: Record<string, any> = {};

    features.forEach((f) => {
      featureMap[f.key] = true;
      configMap[f.key] = f.config;
    });

    return {
      features,
      featureMap,
      configMap,
    };
  }

  /**
   * Admin full view of all features with grouping, status, and config
   */
  static async getAllFeaturesForAdmin(group?: FeatureGroup) {
    await this.ensureSeeded();

    const where = group ? { group } : {};
    const features = await prisma.commerceFeature.findMany({
      where,
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
      include: {
        _count: {
          select: { auditLogs: true },
        },
      },
    });

    // Summary counts
    const total = features.length;
    const activeCount = features.filter((f) => f.isEnabled && f.status === FeatureStatus.ACTIVE).length;
    const disabledCount = features.filter((f) => !f.isEnabled).length;

    return {
      summary: {
        total,
        activeCount,
        disabledCount,
      },
      features,
    };
  }

  /**
   * Get single feature by key with recent audit logs
   */
  static async getFeatureByKey(key: string) {
    const feature = await prisma.commerceFeature.findUnique({
      where: { key },
      include: {
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!feature) {
      throw new AppError(`Feature with key '${key}' not found.`, 404, 'NOT_FOUND');
    }

    return feature;
  }

  /**
   * Toggle or update a feature's configuration (Admin only)
   */
  static async updateFeature(
    key: string,
    data: {
      isEnabled?: boolean;
      status?: FeatureStatus;
      showInNavigation?: boolean;
      navigationLabel?: string;
      navigationPath?: string;
      showOnHomepage?: boolean;
      homepageSortOrder?: number;
      config?: Record<string, any>;
      minimumOrderValue?: number;
      maximumOrderValue?: number;
    },
    adminActor: { id: string; name: string; role: AdminRole },
    reqMeta?: { ipAddress?: string; userAgent?: string }
  ) {
    const existing = await prisma.commerceFeature.findUnique({
      where: { key },
    });

    if (!existing) {
      throw new AppError(`Feature '${key}' does not exist.`, 404, 'NOT_FOUND');
    }

    // Safety checks: If turning ON, ensure status is ACTIVE or DRAFT
    let targetStatus = data.status || existing.status;
    if (data.isEnabled === true && targetStatus === FeatureStatus.DISABLED) {
      targetStatus = FeatureStatus.ACTIVE;
    } else if (data.isEnabled === false) {
      targetStatus = FeatureStatus.DISABLED;
    }

    // Prepare update payload
    const updatePayload: any = {
      updatedBy: adminActor.name || adminActor.id,
      updatedAt: new Date(),
    };

    if (data.isEnabled !== undefined) updatePayload.isEnabled = data.isEnabled;
    if (targetStatus !== undefined) updatePayload.status = targetStatus;
    if (data.showInNavigation !== undefined) updatePayload.showInNavigation = data.showInNavigation;
    if (data.navigationLabel !== undefined) updatePayload.navigationLabel = data.navigationLabel;
    if (data.navigationPath !== undefined) updatePayload.navigationPath = data.navigationPath;
    if (data.showOnHomepage !== undefined) updatePayload.showOnHomepage = data.showOnHomepage;
    if (data.homepageSortOrder !== undefined) updatePayload.homepageSortOrder = data.homepageSortOrder;
    if (data.config !== undefined) updatePayload.config = data.config;
    if (data.minimumOrderValue !== undefined) updatePayload.minimumOrderValue = data.minimumOrderValue;
    if (data.maximumOrderValue !== undefined) updatePayload.maximumOrderValue = data.maximumOrderValue;

    const updated = await prisma.commerceFeature.update({
      where: { key },
      data: updatePayload,
    });

    // Record Immutable Audit Log
    await prisma.commerceAuditLog.create({
      data: {
        featureId: existing.id,
        featureKey: existing.key,
        actorId: adminActor.id,
        actorName: adminActor.name,
        actorRole: adminActor.role,
        action: data.isEnabled !== undefined && data.isEnabled !== existing.isEnabled ? 'TOGGLE_ENABLED' : 'UPDATE_CONFIG',
        oldValue: {
          isEnabled: existing.isEnabled,
          status: existing.status,
          config: existing.config,
          showInNavigation: existing.showInNavigation,
        },
        newValue: {
          isEnabled: updated.isEnabled,
          status: updated.status,
          config: updated.config,
          showInNavigation: updated.showInNavigation,
        },
        ipAddress: reqMeta?.ipAddress,
        userAgent: reqMeta?.userAgent,
      },
    });

    return updated;
  }

  /**
   * Log an event for analytics tracking (e.g. SCENT_FINDER_COMPLETED)
   */
  static async logEvent(data: {
    eventType: string;
    featureKey?: string;
    customerId?: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }) {
    return prisma.commerceEventLog.create({
      data: {
        eventType: data.eventType,
        featureKey: data.featureKey,
        customerId: data.customerId,
        sessionId: data.sessionId,
        metadata: data.metadata || {},
      },
    });
  }

  /**
   * Quick check helper for backend guards: isFeatureEnabled('wishlist')
   */
  static async isEnabled(key: string): Promise<boolean> {
    const feat = await prisma.commerceFeature.findUnique({
      where: { key },
      select: { isEnabled: true, status: true },
    });
    return !!(feat && feat.isEnabled && feat.status === FeatureStatus.ACTIVE);
  }

  /**
   * Ensure default seed exists
   */
  private static async ensureSeeded() {
    const count = await prisma.commerceFeature.count();
    if (count === 0) {
      await this.seedDefaults();
    }
  }
}
