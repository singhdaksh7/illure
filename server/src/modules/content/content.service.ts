import { prisma } from '../../utils/prisma.js';
import { BannerPosition, PageStatus } from '@prisma/client';

export class ContentService {
  // ==========================================
  // BANNERS
  // ==========================================
  static async listBanners(activeOnly = false) {
    const now = new Date();
    const where: any = {};
    if (activeOnly) {
      where.isEnabled = true;
      where.OR = [
        { startAt: null, endAt: null },
        { startAt: { lte: now }, endAt: null },
        { startAt: null, endAt: { gte: now } },
        { startAt: { lte: now }, endAt: { gte: now } },
      ];
    }
    return prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async createBanner(data: {
    name: string;
    position?: BannerPosition;
    desktopImageUrl: string;
    mobileImageUrl?: string;
    headline?: string;
    subheadline?: string;
    ctaLabel?: string;
    ctaUrl?: string;
    startAt?: Date | string | null;
    endAt?: Date | string | null;
    isEnabled?: boolean;
    sortOrder?: number;
  }) {
    return prisma.banner.create({
      data: {
        name: data.name,
        position: data.position || BannerPosition.HOMEPAGE,
        desktopImageUrl: data.desktopImageUrl,
        mobileImageUrl: data.mobileImageUrl || null,
        headline: data.headline || null,
        subheadline: data.subheadline || null,
        ctaLabel: data.ctaLabel || null,
        ctaUrl: data.ctaUrl || null,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        isEnabled: data.isEnabled ?? true,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  static async updateBanner(id: string, data: any) {
    return prisma.banner.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.position !== undefined ? { position: data.position } : {}),
        ...(data.desktopImageUrl !== undefined ? { desktopImageUrl: data.desktopImageUrl } : {}),
        ...(data.mobileImageUrl !== undefined ? { mobileImageUrl: data.mobileImageUrl } : {}),
        ...(data.headline !== undefined ? { headline: data.headline } : {}),
        ...(data.subheadline !== undefined ? { subheadline: data.subheadline } : {}),
        ...(data.ctaLabel !== undefined ? { ctaLabel: data.ctaLabel } : {}),
        ...(data.ctaUrl !== undefined ? { ctaUrl: data.ctaUrl } : {}),
        ...(data.startAt !== undefined ? { startAt: data.startAt ? new Date(data.startAt) : null } : {}),
        ...(data.endAt !== undefined ? { endAt: data.endAt ? new Date(data.endAt) : null } : {}),
        ...(data.isEnabled !== undefined ? { isEnabled: data.isEnabled } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
  }

  static async deleteBanner(id: string) {
    return prisma.banner.delete({ where: { id } });
  }

  // ==========================================
  // ANNOUNCEMENT TICKERS
  // ==========================================
  static async listTickers(activeOnly = false) {
    const now = new Date();
    const where: any = {};
    if (activeOnly) {
      where.isEnabled = true;
      where.OR = [
        { startAt: null, endAt: null },
        { startAt: { lte: now }, endAt: null },
        { startAt: null, endAt: { gte: now } },
        { startAt: { lte: now }, endAt: { gte: now } },
      ];
    }
    return prisma.announcementTicker.findMany({
      where,
      orderBy: { priority: 'asc' },
    });
  }

  static async createTicker(data: {
    message: string;
    linkLabel?: string;
    linkUrl?: string;
    priority?: number;
    startAt?: Date | string | null;
    endAt?: Date | string | null;
    isEnabled?: boolean;
  }) {
    return prisma.announcementTicker.create({
      data: {
        message: data.message,
        linkLabel: data.linkLabel || null,
        linkUrl: data.linkUrl || null,
        priority: data.priority || 0,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        isEnabled: data.isEnabled ?? true,
      },
    });
  }

  static async updateTicker(id: string, data: any) {
    return prisma.announcementTicker.update({
      where: { id },
      data: {
        ...(data.message !== undefined ? { message: data.message } : {}),
        ...(data.linkLabel !== undefined ? { linkLabel: data.linkLabel } : {}),
        ...(data.linkUrl !== undefined ? { linkUrl: data.linkUrl } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.startAt !== undefined ? { startAt: data.startAt ? new Date(data.startAt) : null } : {}),
        ...(data.endAt !== undefined ? { endAt: data.endAt ? new Date(data.endAt) : null } : {}),
        ...(data.isEnabled !== undefined ? { isEnabled: data.isEnabled } : {}),
      },
    });
  }

  static async deleteTicker(id: string) {
    return prisma.announcementTicker.delete({ where: { id } });
  }

  // ==========================================
  // STATIC PAGES
  // ==========================================
  static async listStaticPages(publishedOnly = false) {
    const where: any = {};
    if (publishedOnly) {
      where.status = PageStatus.PUBLISHED;
    }
    return prisma.staticPage.findMany({
      where,
      orderBy: { title: 'asc' },
    });
  }

  static async getStaticPageBySlug(slug: string) {
    const page = await prisma.staticPage.findUnique({
      where: { slug },
    });
    if (!page) {
      throw { statusCode: 404, code: 'PAGE_NOT_FOUND', message: 'Page not found.' };
    }
    return page;
  }

  static async createStaticPage(data: {
    slug: string;
    title: string;
    content: string;
    status?: PageStatus;
    seoTitle?: string;
    seoDescription?: string;
  }) {
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const existing = await prisma.staticPage.findUnique({ where: { slug } });
    if (existing) {
      throw { statusCode: 400, code: 'SLUG_EXISTS', message: `Static page with slug "${slug}" already exists.` };
    }

    const status = data.status || PageStatus.PUBLISHED;

    return prisma.staticPage.create({
      data: {
        slug,
        title: data.title,
        content: data.content,
        status,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        publishedAt: status === PageStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  static async updateStaticPage(id: string, data: any) {
    if (data.slug) {
      const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const existing = await prisma.staticPage.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        throw { statusCode: 400, code: 'SLUG_EXISTS', message: `Static page with slug "${slug}" already exists.` };
      }
      data.slug = slug;
    }

    return prisma.staticPage.update({
      where: { id },
      data: {
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle } : {}),
        ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription } : {}),
        ...(data.status === PageStatus.PUBLISHED ? { publishedAt: new Date() } : {}),
      },
    });
  }

  static async deleteStaticPage(id: string) {
    return prisma.staticPage.delete({ where: { id } });
  }

  // ==========================================
  // URL REDIRECTS
  // ==========================================
  static async listRedirects() {
    return prisma.urlRedirect.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createRedirect(data: {
    sourcePath: string;
    targetPath: string;
    statusCode?: number;
    isActive?: boolean;
  }) {
    const sourcePath = data.sourcePath.startsWith('/') ? data.sourcePath : `/${data.sourcePath}`;
    const targetPath = data.targetPath.startsWith('/') || data.targetPath.startsWith('http') ? data.targetPath : `/${data.targetPath}`;

    return prisma.urlRedirect.upsert({
      where: { sourcePath },
      create: {
        sourcePath,
        targetPath,
        statusCode: data.statusCode || 301,
        isActive: data.isActive ?? true,
      },
      update: {
        targetPath,
        statusCode: data.statusCode || 301,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async deleteRedirect(id: string) {
    return prisma.urlRedirect.delete({ where: { id } });
  }

  static async findRedirect(sourcePath: string) {
    const normalized = sourcePath.startsWith('/') ? sourcePath : `/${sourcePath}`;
    return prisma.urlRedirect.findFirst({
      where: { sourcePath: normalized, isActive: true },
    });
  }
}
