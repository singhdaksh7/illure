import { prisma } from '../../utils/prisma.js';

export const DEFAULT_HOMEPAGE_SECTIONS = [
  {
    sectionKey: 'hero',
    name: 'Hero Campaign',
    sortOrder: 1,
    isEnabled: true,
    layoutVariant: 'CINEMATIC',
    title: 'Fragrance,\nReimagined.',
    subtitle: 'THE HOUSE OF İLLURÊ',
    description: 'Distinctive scent profiles inspired by icons, finished in the language of İLLURÊ.',
    ctaLabel: 'EXPLORE THE COLLECTION',
    ctaUrl: '#catalog',
    desktopImage: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1920',
    mobileImage: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=900',
    customData: {
      secondaryCtaLabel: 'DISCOVER İLLURÊ',
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
    title: 'Perfume is memory.\nİLLURÊ makes it yours.',
    subtitle: 'THE ESSENCE OF QUIET LUXURY',
    description: 'Developed with attention to balance and depth, each silhouette expresses enduring presence and intimacy.',
    ctaLabel: 'OUR PHILOSOPHY',
    ctaUrl: '#brand-story',
    customData: {
      calloutNote: 'Formulated with attention to harmonic balance and seamless day-to-night transitions.',
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
    title: 'FEATURED CREATIONS',
    subtitle: 'CURATED SELECTIONS',
    description: 'Distinctive scent compositions defined by depth, tension, and lingering warmth.',
    ctaLabel: 'VIEW ALL FRAGRANCES',
    ctaUrl: '#catalog',
    isPublished: true,
  },
  {
    sectionKey: 'collections',
    name: 'Curated Collections',
    sortOrder: 4,
    isEnabled: true,
    layoutVariant: 'THREE_PANEL', // THREE_PANEL | TWO_COLUMN | HERO
    title: 'THE EDITIONS',
    subtitle: 'STRUCTURED HARMONIES',
    description: 'Organized by olfactory architecture, from solar woods to velvet resins.',
    ctaLabel: 'DISCOVER EDITIONS',
    ctaUrl: '#catalog',
    isPublished: true,
  },
  {
    sectionKey: 'shop_by_mood',
    name: 'Shop by Mood',
    sortOrder: 5,
    isEnabled: true,
    layoutVariant: 'PANELS',
    title: 'AURA & INTENT',
    subtitle: 'SELECT YOUR LANDSCAPE',
    description: 'Choose fragrances attuned to the atmosphere you wish to inhabit.',
    customData: {
      moods: [
        {
          id: 'after-dark',
          name: 'AFTER DARK',
          tagline: 'Smoky Amber & Intoxicating Woods',
          description: 'Deep, sensual, designed for midnight shadows and velvet candlelight.',
          image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=900',
          filter: 'evening',
        },
        {
          id: 'first-light',
          name: 'FIRST LIGHT',
          tagline: 'Solar Citrus & White Florals',
          description: 'Luminous, crystalline, opening with vibrant freshness.',
          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=900',
          filter: 'day',
        },
        {
          id: 'quiet-confidence',
          name: 'QUIET CONFIDENCE',
          tagline: 'Precious Iris & Cedar Architecture',
          description: 'Subtle elegance that whispers rather than shouts.',
          image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=900',
          filter: 'signature',
        },
        {
          id: 'the-statement',
          name: 'THE STATEMENT',
          tagline: 'Oud Royal & Spiced Saffron',
          description: 'Commanding attention without compromise.',
          image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=900',
          filter: 'bestsellers',
        },
        {
          id: 'weekend-escape',
          name: 'WEEKEND ESCAPE',
          tagline: 'Aquatic Breeze & Sea Salt Drift',
          description: 'Effortless freedom and coastal vitality.',
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
    title: 'THE ARCHITECTURE OF SCENT',
    subtitle: 'OUR MAISON',
    description: 'İLLURÊ FRAGRANCE was founded on the philosophy that distinctive perfumery should be an intimate daily ritual. Inspired by iconic profiles and crafted with singular aesthetic vision.',
    ctaLabel: 'EXPLORE OUR HERITAGE',
    ctaUrl: '#catalog',
    desktopImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200',
    customData: {
      quote: '“We sculpt memories in liquid form, balancing shadow and illumination in every flacon.”',
      founderSignature: 'The İLLURÊ Studio',
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
    subtitle: 'THE EXPERIENCE',
    description: 'Each creation transforms as skin breathes warmth into nuanced perfume compositions.',
    ctaLabel: 'DISCOVER THE CRAFT',
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
    title: 'THE SIGNATURE REPERTORY',
    subtitle: 'MOST SOUGHT AFTER',
    description: 'The definitive fragrances chosen repeatedly by our distinguished patrons.',
    ctaLabel: 'EXPLORE ALL BESTSELLERS',
    ctaUrl: '#catalog',
    isPublished: true,
  },
  {
    sectionKey: 'new_arrivals',
    name: 'New Arrivals Campaign',
    sortOrder: 9,
    isEnabled: true,
    layoutVariant: 'CAMPAIGN', // CAMPAIGN | GRID
    title: 'NEW HORIZONS',
    subtitle: 'RECENT COMPOSITIONS',
    description: 'Fresh additions to the İLLURÊ portfolio, showcasing vanguard accords.',
    ctaLabel: 'VIEW NEW ARRIVALS',
    ctaUrl: '#catalog',
    isPublished: true,
  },
  {
    sectionKey: 'authenticity',
    name: 'House Philosophy & Standards',
    sortOrder: 10,
    isEnabled: true,
    layoutVariant: 'FOUR_PILLARS',
    title: 'THE İLLURÊ STANDARDS',
    subtitle: 'CORE TENETS',
    description: 'Principles guiding each fragrance created under the hallmark of İLLURÊ.',
    customData: {
      pillars: [
        {
          title: 'CRAFTED WITH INTENT',
          description: 'Concentrated fragrance compositions developed with careful attention to olfactory balance and character.',
        },
        {
          title: 'REFINED SILHOUETTE',
          description: 'Compact flacons calibrated for tactile weight and daily accompaniment on your journey.',
        },
        {
          title: 'PACKAGED BY İLLURÊ',
          description: 'Obsidian presentation boxes lined with velvet touch packaging worthy of gifting.',
        },
        {
          title: 'DELIVERED WITH CARE',
          description: 'Inspected by hand, tamper-sealed, and dispatched in custom protective casing.',
        },
      ],
    },
    isPublished: true,
  },
  {
    sectionKey: 'newsletter',
    name: 'Private Notes Newsletter',
    sortOrder: 11,
    isEnabled: true,
    layoutVariant: 'INTEGRATED',
    title: 'PRIVATE NOTES FROM İLLURÊ',
    subtitle: 'MEMBERS PRIVILEGE',
    description: 'Receive private drop announcements, limited small-batch allocations, and olfactory insights directly to your inbox.',
    ctaLabel: 'JOIN THE MAISON',
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
    text: 'Complimentary shipping on qualifying orders — Handcrafted Luxury Formulations',
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
        { label: 'New Arrivals', filter: 'new' },
      ],
      discover: [
        { label: 'Inspired Collections', href: '#collections' },
        { label: 'Fragrance Families', href: '#catalog' },
        { label: 'Shop by Mood', href: '#mood' },
      ],
      editorial: [
        { label: 'Our Story', href: '#brand-story' },
        { label: 'Craft & Standards', href: '#authenticity' },
        { label: 'Gifting Experience', href: '#catalog' },
      ],
      featuredPromotion: {
        title: 'ROYAL OUD REIMAGINED',
        subtitle: 'The Signature Interpretation',
        imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600',
        ctaText: 'Discover Scent',
        ctaUrl: '#catalog',
      },
    },
  },
  footer: {
    tagline: 'Haute perfumery reimagined through quiet luxury, exceptional presence, and architectural design.',
    copyright: '© 2026 İLLURÊ FRAGRANCE. All rights reserved.',
    disclaimer: 'Reference brand names are used only to describe fragrance inspiration and olfactory reference. İLLURÊ FRAGRANCE is an independent brand and is not affiliated with, endorsed by, or sponsored by the referenced trademark owners.',
    columns: [
      {
        title: 'SHOP',
        links: [
          { label: 'All Fragrances', href: '#catalog' },
          { label: 'Bestsellers', href: '#bestsellers' },
          { label: 'New Arrivals', href: '#new-arrivals' },
          { label: 'Gift Packaging', href: '#catalog' },
        ],
      },
      {
        title: 'DISCOVER',
        links: [
          { label: 'The House of İLLURÊ', href: '#brand-story' },
          { label: 'Fragrance Notes', href: '#collections' },
          { label: 'Shop By Mood', href: '#mood' },
          { label: 'House Standards', href: '#authenticity' },
        ],
      },
      {
        title: 'SUPPORT',
        links: [
          { label: 'Order Tracking', href: '#orders' },
          { label: 'Shipping & Delivery', href: '#shipping' },
          { label: 'FAQ & Sizing', href: '#faq' },
          { label: 'Concierge Support', href: 'mailto:concierge@illurefragrance.com' },
        ],
      },
      {
        title: 'LEGAL',
        links: [
          { label: 'Privacy Policy', href: '#privacy' },
          { label: 'Terms of Service', href: '#terms' },
          { label: 'House Standards', href: '#authenticity' },
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

