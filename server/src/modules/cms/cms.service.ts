import { prisma } from '../../utils/prisma.js';

export const DEFAULT_HOMEPAGE_SECTIONS = [
  {
    sectionKey: 'hero',
    name: 'Hero Campaign',
    sortOrder: 1,
    isEnabled: true,
    layoutVariant: 'CINEMATIC',
    title: 'WEAR SOMETHING\nTHEY REMEMBER.',
    subtitle: 'İLLURÊ FRAGRANCE',
    description: 'Inspired fragrance. Made the İLLURÊ way.',
    ctaLabel: 'SHOP FRAGRANCES',
    ctaUrl: '#catalog',
    desktopImage: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1920',
    mobileImage: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=900',
    customData: {
      secondaryCtaLabel: 'OUR STORY',
      secondaryCtaUrl: '#brand-story',
      overlayStrength: 0.65,
      heroHeight: '100vh',
      textAlignment: 'center',
      bottleImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
      badgeText: 'EXTRAIT DE PARFUM',
    },
    isPublished: true,
  },
  {
    sectionKey: 'editorial_intro',
    name: 'Editorial Brand Statement',
    sortOrder: 2,
    isEnabled: true,
    layoutVariant: 'DEFAULT',
    title: 'Your scent should say something\nbefore you do.',
    subtitle: 'THE İLLURÊ POINT OF VIEW',
    description: 'Familiar inspiration. A different identity. Thoughtfully balanced so your scent holds its ground without shouting.',
    ctaLabel: 'EXPLORE THE LINEUP',
    ctaUrl: '#catalog',
    customData: {
      calloutNote: 'Good fragrance doesn’t need a long explanation.',
      establishedYear: '2026',
    },
    isPublished: true,
  },
  {
    sectionKey: 'featured_fragrances',
    name: 'Featured Fragrances',
    sortOrder: 3,
    isEnabled: true,
    layoutVariant: 'EDITORIAL', // EDITORIAL | GRID | CAROUSEL
    title: 'FEATURED LINEUP',
    subtitle: 'SELECTED SCENTS',
    description: 'Dark, warm, and built with distinct character.',
    ctaLabel: 'VIEW ALL FRAGRANCES',
    ctaUrl: '#catalog',
    isPublished: true,
  },
  {
    sectionKey: 'collections',
    name: 'Fragrance Editions',
    sortOrder: 4,
    isEnabled: true,
    layoutVariant: 'THREE_PANEL', // THREE_PANEL | TWO_COLUMN | HERO
    title: 'THE EDITIONS',
    subtitle: 'FRAGRANCE DIRECTIONS',
    description: 'Pick your profile. From heavy ambers to crisp woods.',
    ctaLabel: 'EXPLORE EDITIONS',
    ctaUrl: '#catalog',
    isPublished: true,
  },
  {
    sectionKey: 'shop_by_mood',
    name: 'Shop by Mood',
    sortOrder: 5,
    isEnabled: true,
    layoutVariant: 'PANELS',
    title: 'SHOP BY MOOD',
    subtitle: 'WHEN TO WEAR',
    description: 'Pick the mood. Make it yours.',
    customData: {
      moods: [
        {
          id: 'after-dark',
          name: 'AFTER DARK',
          tagline: 'Smoky Amber & Cedar',
          description: 'Deep, warm, made for evenings that run late.',
          image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=900',
          filter: 'evening',
        },
        {
          id: 'first-impression',
          name: 'FIRST IMPRESSION',
          tagline: 'Bergamot & Crisp Pepper',
          description: 'Sharp, clean opening that commands attention.',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=900',
          filter: 'day',
        },
        {
          id: 'everyday',
          name: 'EVERYDAY',
          tagline: 'Iris & Dry Woods',
          description: 'Low-key presence. You don’t need an occasion.',
          image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=900',
          filter: 'signature',
        },
        {
          id: 'date-night',
          name: 'DATE NIGHT',
          tagline: 'Warm Vanilla & Spiced Tobacco',
          description: 'Intimate and close. Best on skin.',
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=900',
          filter: 'bestsellers',
        },
        {
          id: 'the-weekend',
          name: 'THE WEEKEND',
          tagline: 'Mineral Musk & Sea Salt',
          description: 'Clean with an edge. Easy to wear anywhere.',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=900',
          filter: 'fresh',
        },
      ],
    },
    isPublished: true,
  },
  {
    sectionKey: 'brand_story',
    name: 'Brand Story',
    sortOrder: 6,
    isEnabled: true,
    layoutVariant: 'IMAGE_LEFT', // IMAGE_LEFT | IMAGE_RIGHT | FULL_BLEED
    title: 'SCENT, WITHOUT THE NOISE',
    subtitle: 'THE İLLURÊ STORY',
    description: 'We started İLLURÊ for one simple reason: good fragrance shouldn’t feel complicated. We take scent profiles people already love and reinterpret them in our own way. Easy to try. Easy to carry. Easy to make yours.',
    ctaLabel: 'EXPLORE FRAGRANCES',
    ctaUrl: '#catalog',
    desktopImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200',
    customData: {
      quote: '“Familiar inspiration. Our own point of view.”',
      founderSignature: 'The İLLURÊ Team',
    },
    isPublished: true,
  },
  {
    sectionKey: 'cinematic_moment',
    name: 'Cinematic Brand Moment',
    sortOrder: 7,
    isEnabled: true,
    layoutVariant: 'FULL_BLEED',
    title: 'TIME SUSPENDED IN LIQUID GOLD',
    subtitle: 'THE ESSENCE',
    description: 'A fragrance does not simply accompany. It announces and lingers.',
    ctaLabel: 'DISCOVER SCENTS',
    ctaUrl: '#catalog',
    desktopImage: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=1920',
    isPublished: true,
  },
  {
    sectionKey: 'bestsellers',
    name: 'Bestseller Carousel',
    sortOrder: 8,
    isEnabled: true,
    layoutVariant: 'CAROUSEL', // CAROUSEL | GRID
    title: 'BESTSELLERS',
    subtitle: 'MOST WORN',
    description: 'The scents people reorder most.',
    ctaLabel: 'EXPLORE BESTSELLERS',
    ctaUrl: '#catalog',
    isPublished: true,
  },
  {
    sectionKey: 'new_arrivals',
    name: 'New Drops Campaign',
    sortOrder: 9,
    isEnabled: true,
    layoutVariant: 'CAMPAIGN', // CAMPAIGN | GRID
    title: 'NEW DROPS',
    subtitle: 'RECENT ADDITIONS',
    description: 'Fresh additions to the lineup. High character, zero noise.',
    ctaLabel: 'VIEW NEW DROPS',
    ctaUrl: '#catalog',
    isPublished: true,
  },
  {
    sectionKey: 'authenticity',
    name: 'Why İLLURÊ',
    sortOrder: 10,
    isEnabled: true,
    layoutVariant: 'FOUR_PILLARS',
    title: 'WHY İLLURÊ',
    subtitle: 'THE FOUR PRINCIPLES',
    description: 'Good fragrance, made straightforward.',
    customData: {
      pillars: [
        {
          number: '01',
          title: 'YOUR SIZE',
          description: 'Choose what works for you. From pocket-friendly flacons to full bottles.',
        },
        {
          number: '02',
          title: 'YOUR SCENT',
          description: 'Inspired fragrance profiles with an İLLURÊ identity. Straightforward character.',
        },
        {
          number: '03',
          title: 'YOUR WAY',
          description: 'Wear it wherever you want. You don’t need a black-tie invitation.',
        },
        {
          number: '04',
          title: 'PACKED PROPERLY',
          description: 'Designed to feel good in the hand before you even spray it.',
        },
      ],
    },
    isPublished: true,
  },
  {
    sectionKey: 'newsletter',
    name: 'Newsletter',
    sortOrder: 11,
    isEnabled: true,
    layoutVariant: 'INTEGRATED',
    title: 'STAY IN THE LOOP',
    subtitle: 'DROPS & RESTOCKS',
    description: 'New releases. Restocks. Offers worth opening.',
    ctaLabel: 'JOIN',
    isPublished: true,
  },
];

export const DEFAULT_SITE_SETTINGS: Record<string, any> = {
  appearance: {
    preset: 'ILLURÊ OBSIDIAN',
    primaryBg: '#0B0B0C',
    secondaryBg: '#121214',
    surfaceBg: '#18181B',
    accentGold: '#B89A62',
    accentGoldMuted: '#A98B55',
    textPrimary: '#F7F4EE',
    textMuted: '#A1A1AA',
    borderRadius: 'minimal',
    fontScale: 'editorial',
  },
  announcement: {
    isEnabled: true,
    text: 'Free shipping on orders over ₹999 · Scent, without the noise',
    linkUrl: '#catalog',
    theme: 'gold_subtle',
  },
  navigation: {
    items: [
      { id: 'shop', label: 'Shop', href: '#catalog', hasMegaMenu: true },
      { id: 'discover', label: 'Discover', href: '#collections', hasMegaMenu: true },
      { id: 'story', label: 'Our Story', href: '#brand-story', hasMegaMenu: false },
      { id: 'mood', label: 'Shop by Mood', href: '#mood', hasMegaMenu: false },
    ],
    megaMenu: {
      shop: [
        { label: 'All Fragrances', filter: 'all' },
        { label: 'Men', filter: 'MEN' },
        { label: 'Women', filter: 'WOMEN' },
        { label: 'Unisex', filter: 'UNISEX' },
        { label: 'Bestsellers', filter: 'bestsellers' },
        { label: 'New Drops', filter: 'new' },
      ],
      discover: [
        { label: 'Fragrance Editions', href: '#collections' },
        { label: 'Scent Families', href: '#catalog' },
        { label: 'Shop by Mood', href: '#mood' },
      ],
      editorial: [
        { label: 'Our Story', href: '#brand-story' },
        { label: 'Why İLLURÊ', href: '#authenticity' },
        { label: 'Gift Packaging', href: '#catalog' },
      ],
      featuredPromotion: {
        title: 'DARK. WARM. ADDICTIVE.',
        subtitle: 'Built for after dark',
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600',
        ctaText: 'Explore Scent',
        ctaUrl: '#catalog',
      },
    },
  },
  footer: {
    tagline: 'Scent, without the noise. Familiar notes with our own point of view.',
    copyright: '© 2026 İLLURÊ FRAGRANCE. All rights reserved.',
    disclaimer: 'Reference brand names are used only to describe fragrance inspiration and olfactory reference. İLLURÊ FRAGRANCE is an independent brand and is not affiliated with, endorsed by, or sponsored by the referenced trademark owners.',
    columns: [
      {
        title: 'SHOP',
        links: [
          { label: 'All Fragrances', href: '#catalog' },
          { label: 'Bestsellers', href: '#bestsellers' },
          { label: 'New Drops', href: '#new-arrivals' },
          { label: 'Gift Packaging', href: '#catalog' },
        ],
      },
      {
        title: 'DISCOVER',
        links: [
          { label: 'The İLLURÊ Story', href: '#brand-story' },
          { label: 'Fragrance Notes', href: '#collections' },
          { label: 'Shop By Mood', href: '#mood' },
          { label: 'Why İLLURÊ', href: '#authenticity' },
        ],
      },
      {
        title: 'SUPPORT',
        links: [
          { label: 'Order Tracking', href: '#orders' },
          { label: 'Shipping & Delivery', href: '#shipping' },
          { label: 'FAQ & Sizing', href: '#faq' },
          { label: 'Contact', href: 'mailto:concierge@illurefragrance.com' },
        ],
      },
      {
        title: 'LEGAL',
        links: [
          { label: 'Privacy Policy', href: '#privacy' },
          { label: 'Terms of Service', href: '#terms' },
          { label: 'Why İLLURÊ', href: '#authenticity' },
        ],
      },
    ],
  },
  brand_contacts: {
    email: null,
    phone: null,
    whatsapp: null,
    instagram: null,
    facebook: null,
  },
};

export class CmsService {
  /**
   * Ensure default sections and settings exist in database.
   */
  static async seedDefaultsIfNeeded() {
    const sectionCount = await prisma.homepageSection.count();
    if (sectionCount === 0) {
      for (const section of DEFAULT_HOMEPAGE_SECTIONS) {
        await prisma.homepageSection.create({
          data: section,
        });
      }
    }

    for (const [key, val] of Object.entries(DEFAULT_SITE_SETTINGS)) {
      const existing = await prisma.siteSetting.findUnique({ where: { key } });
      if (!existing) {
        await prisma.siteSetting.create({
          data: {
            key,
            value: val,
          },
        });
      }
    }
  }

  /**
   * Get all published homepage sections and site settings for the public storefront.
   */
  static async getPublicCmsData() {
    await this.seedDefaultsIfNeeded();

    const sections = await prisma.homepageSection.findMany({
      where: { isEnabled: true, isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });

    const settingsRows = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, any> = {};
    for (const row of settingsRows) {
      settingsMap[row.key] = row.value;
    }

    // Merge with fallbacks if any setting key is missing
    const appearance = settingsMap['appearance'] || DEFAULT_SITE_SETTINGS.appearance;
    const announcement = settingsMap['announcement'] || DEFAULT_SITE_SETTINGS.announcement;
    const navigation = settingsMap['navigation'] || DEFAULT_SITE_SETTINGS.navigation;
    const footer = settingsMap['footer'] || DEFAULT_SITE_SETTINGS.footer;
    const brand_contacts = settingsMap['brand_contacts'] || DEFAULT_SITE_SETTINGS.brand_contacts;

    // Also get active shipping threshold
    const shipping = await prisma.shippingSetting.findFirst();

    return {
      sections,
      settings: {
        appearance,
        announcement,
        navigation,
        footer,
        brand_contacts,
        shipping: shipping
          ? {
              flatRate: Number(shipping.flatRate),
              freeShippingThreshold: Number(shipping.freeShippingThreshold),
              isEnabled: shipping.isEnabled,
            }
          : { flatRate: 99, freeShippingThreshold: 999, isEnabled: true },
      },
    };
  }

  /**
   * Admin: List all homepage sections (enabled and disabled)
   */
  static async getAllSections() {
    await this.seedDefaultsIfNeeded();
    return prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Admin: Get single section
   */
  static async getSectionById(id: string) {
    const section = await prisma.homepageSection.findUnique({ where: { id } });
    if (!section) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Homepage section not found.' };
    }
    return section;
  }

  /**
   * Admin: Update section
   */
  static async updateSection(id: string, data: Partial<{
    name: string;
    isEnabled: boolean;
    sortOrder: number;
    layoutVariant: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    ctaLabel: string | null;
    ctaUrl: string | null;
    desktopImage: string | null;
    mobileImage: string | null;
    customData: any;
    isPublished: boolean;
  }>) {
    const existing = await prisma.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Homepage section not found.' };
    }

    if (data.title && typeof data.title === 'string' && data.title.length > 255) {
      throw { statusCode: 400, code: 'FIELD_TOO_LONG', message: 'Section title cannot exceed 255 characters.' };
    }
    if (data.subtitle && typeof data.subtitle === 'string' && data.subtitle.length > 255) {
      throw { statusCode: 400, code: 'FIELD_TOO_LONG', message: 'Section subtitle cannot exceed 255 characters.' };
    }
    if (data.description && typeof data.description === 'string' && data.description.length > 2000) {
      throw { statusCode: 400, code: 'FIELD_TOO_LONG', message: 'Section description cannot exceed 2000 characters.' };
    }
    if (data.ctaLabel && typeof data.ctaLabel === 'string' && data.ctaLabel.length > 100) {
      throw { statusCode: 400, code: 'FIELD_TOO_LONG', message: 'CTA label cannot exceed 100 characters.' };
    }
    if (data.ctaUrl && typeof data.ctaUrl === 'string') {
      if (data.ctaUrl.length > 500) {
        throw { statusCode: 400, code: 'FIELD_TOO_LONG', message: 'CTA URL cannot exceed 500 characters.' };
      }
      const lower = data.ctaUrl.trim().toLowerCase();
      if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:')
      ) {
        throw { statusCode: 400, code: 'INVALID_URL', message: 'Dangerous URL scheme rejected.' };
      }
    }

    if (data.customData && typeof data.customData === 'object') {
      if (data.customData.overlayStrength !== undefined) {
        const overlay = Number(data.customData.overlayStrength);
        if (isNaN(overlay) || overlay < 0.1 || overlay > 0.95) {
          throw { statusCode: 400, code: 'INVALID_OVERLAY_STRENGTH', message: 'overlayStrength must be a number between 0.1 and 0.95.' };
        }
      }
    }

    return prisma.homepageSection.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.layoutVariant !== undefined && { layoutVariant: data.layoutVariant }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.ctaLabel !== undefined && { ctaLabel: data.ctaLabel }),
        ...(data.ctaUrl !== undefined && { ctaUrl: data.ctaUrl }),
        ...(data.desktopImage !== undefined && { desktopImage: data.desktopImage }),
        ...(data.mobileImage !== undefined && { mobileImage: data.mobileImage }),
        ...(data.customData !== undefined && { customData: data.customData }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    });
  }

  /**
   * Admin: Reorder sections
   */
  static async reorderSections(orderedIds: string[]) {
    return prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.homepageSection.update({
          where: { id: orderedIds[i] },
          data: { sortOrder: i + 1 },
        });
      }
      return tx.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
    });
  }

  /**
   * Admin: Get all site settings
   */
  static async getAllSettings() {
    await this.seedDefaultsIfNeeded();
    const rows = await prisma.siteSetting.findMany();
    const map: Record<string, any> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return {
      appearance: map['appearance'] || DEFAULT_SITE_SETTINGS.appearance,
      announcement: map['announcement'] || DEFAULT_SITE_SETTINGS.announcement,
      navigation: map['navigation'] || DEFAULT_SITE_SETTINGS.navigation,
      footer: map['footer'] || DEFAULT_SITE_SETTINGS.footer,
      brand_contacts: map['brand_contacts'] || DEFAULT_SITE_SETTINGS.brand_contacts,
    };
  }

  /**
   * Admin: Update site setting by key
   */
  static async updateSetting(key: string, value: any) {
    if (!key || typeof key !== 'string') {
      throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Invalid setting key.' };
    }

    if (key === 'appearance' && value && typeof value === 'object') {
      const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
      const colorKeys = [
        'primaryBg',
        'secondaryBg',
        'surfaceBg',
        'accentGold',
        'accentGoldMuted',
        'textPrimary',
        'textMuted',
      ];

      for (const cKey of colorKeys) {
        if (value[cKey] !== undefined && value[cKey] !== null) {
          if (typeof value[cKey] !== 'string' || !hexColorRegex.test(value[cKey].trim())) {
            throw {
              statusCode: 400,
              code: 'INVALID_HEX_COLOR',
              message: `Invalid hex color code for ${cKey}: must be #RGB or #RRGGBB.`,
            };
          }
        }
      }

      if (value.borderRadius !== undefined && value.borderRadius !== null) {
        const allowedRadius = ['sharp', 'subtle', 'soft', 'minimal'];
        if (!allowedRadius.includes(value.borderRadius)) {
          throw {
            statusCode: 400,
            code: 'INVALID_BORDER_RADIUS',
            message: `borderRadius must be one of: ${allowedRadius.join(', ')}.`,
          };
        }
      }

      if (value.fontScale !== undefined && value.fontScale !== null) {
        const allowedFontScales = ['compact', 'editorial', 'grand'];
        if (!allowedFontScales.includes(value.fontScale)) {
          throw {
            statusCode: 400,
            code: 'INVALID_FONT_SCALE',
            message: `fontScale must be one of: ${allowedFontScales.join(', ')}.`,
          };
        }
      }
    }

    if (key === 'announcement' && value && typeof value === 'object') {
      if (value.text && typeof value.text === 'string' && value.text.length > 255) {
        throw { statusCode: 400, code: 'FIELD_TOO_LONG', message: 'Announcement text cannot exceed 255 characters.' };
      }
      if (value.linkUrl && typeof value.linkUrl === 'string') {
        const lower = value.linkUrl.trim().toLowerCase();
        if (
          lower.startsWith('javascript:') ||
          lower.startsWith('data:') ||
          lower.startsWith('vbscript:')
        ) {
          throw { statusCode: 400, code: 'INVALID_URL', message: 'Dangerous URL scheme rejected.' };
        }
      }
    }

    if (key === 'brand_contacts' && value && typeof value === 'object') {
      if (value.email && typeof value.email === 'string' && value.email.length > 255) {
        throw { statusCode: 400, code: 'FIELD_TOO_LONG', message: 'Contact email cannot exceed 255 characters.' };
      }
      if (value.whatsapp && typeof value.whatsapp === 'string' && value.whatsapp.length > 50) {
        throw { statusCode: 400, code: 'FIELD_TOO_LONG', message: 'WhatsApp number cannot exceed 50 characters.' };
      }
    }

    return prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}

