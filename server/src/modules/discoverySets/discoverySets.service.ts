import { prisma } from '../../utils/prisma.js';
import {
  DiscoverySetType,
  DiscoverySetSelectionMode,
  DiscoverySetPricingMode,
  DiscoverySetStatus,
} from '@prisma/client';

export interface CreateDiscoverySetInput {
  name: string;
  slug: string;
  type?: DiscoverySetType;
  status?: DiscoverySetStatus;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  selectionMode?: DiscoverySetSelectionMode;
  minSelections?: number;
  maxSelections?: number;
  pricingMode?: DiscoverySetPricingMode;
  fixedPrice?: number | null;
  discountPercent?: number | null;
  allowDuplicates?: boolean;
  maxPerOrder?: number;
  sortOrder?: number;
  isFeatured?: boolean;
  eligibleProductIds?: string[];
  eligibleVariantIds?: string[];
  prebuiltItems?: Array<{ productId: string; variantId?: string; quantity?: number }>;
}

export class DiscoverySetsService {
  /**
   * Seed default Discovery Sets idempotently
   */
  static async seedDefaults() {
    const defaultSlug = 'custom-discovery-set';
    const existing = await prisma.discoverySetConfig.findUnique({
      where: { slug: defaultSlug },
    });

    if (!existing) {
      // Find all active products to mark as eligible
      const activeProducts = await prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: { variants: { where: { isActive: true } } },
      });

      const config = await prisma.discoverySetConfig.create({
        data: {
          name: 'Signature Discovery Set (3 Fragrances)',
          slug: defaultSlug,
          type: DiscoverySetType.CUSTOM,
          status: DiscoverySetStatus.ACTIVE,
          title: 'BUILD YOUR DISCOVERY SET',
          subtitle: 'Three 3ml or 6ml Miniature Masterworks',
          description:
            'Select any three miniature compositions from the İLLURÊ private collection. Presented in our bespoke obsidian presentation box with parchment discovery blotters.',
          imageUrl: '/images/discovery_set.jpg',
          selectionMode: DiscoverySetSelectionMode.PRODUCT,
          minSelections: 3,
          maxSelections: 3,
          pricingMode: DiscoverySetPricingMode.FIXED,
          fixedPrice: 999.0,
          allowDuplicates: false,
          maxPerOrder: 5,
          sortOrder: 1,
          isFeatured: true,
        },
      });

      // Attach eligible products
      for (let i = 0; i < activeProducts.length; i++) {
        const p = activeProducts[i];
        // find miniature sample variant (3 ML or first available)
        const sampleVariant = p.variants.find((v) => v.sizeLabel.includes('3 ML')) || p.variants[0];
        await prisma.discoverySetEligibleItem.create({
          data: {
            discoverySetId: config.id,
            productId: p.id,
            variantId: sampleVariant?.id || null,
            sortOrder: i + 1,
          },
        });
      }

      // Also create a prebuilt set: "The Obsidian Trilogy"
      const prebuiltSlug = 'obsidian-trilogy-prebuilt';
      const existingPrebuilt = await prisma.discoverySetConfig.findUnique({
        where: { slug: prebuiltSlug },
      });

      if (!existingPrebuilt && activeProducts.length >= 3) {
        const prebuilt = await prisma.discoverySetConfig.create({
          data: {
            name: 'The Obsidian Trilogy',
            slug: prebuiltSlug,
            type: DiscoverySetType.PREBUILT,
            status: DiscoverySetStatus.ACTIVE,
            title: 'THE OBSIDIAN TRILOGY',
            subtitle: 'Curated Evening & Amber Triad',
            description:
              'A curated trio of our darkest, most enigmatic creations: Velvet Oud, Oud Silk Royal, and Imperial Sovereign in 3ml extract miniatures.',
            imageUrl: '/images/discovery_set_dark.jpg',
            selectionMode: DiscoverySetSelectionMode.PRODUCT,
            minSelections: 3,
            maxSelections: 3,
            pricingMode: DiscoverySetPricingMode.FIXED,
            fixedPrice: 999.0,
            allowDuplicates: false,
            maxPerOrder: 5,
            sortOrder: 2,
            isFeatured: true,
          },
        });

        for (let i = 0; i < 3; i++) {
          const p = activeProducts[i];
          const sampleVariant = p.variants.find((v) => v.sizeLabel.includes('3 ML')) || p.variants[0];
          await prisma.discoverySetPrebuiltItem.create({
            data: {
              discoverySetId: prebuilt.id,
              productId: p.id,
              variantId: sampleVariant?.id || null,
              quantity: 1,
              sortOrder: i + 1,
            },
          });
        }
      }
    }
  }

  static async listPublic() {
    return prisma.discoverySetConfig.findMany({
      where: { status: DiscoverySetStatus.ACTIVE },
      include: {
        eligibleItems: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                variants: { where: { isActive: true } },
              },
            },
            variant: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        prebuiltItems: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                variants: { where: { isActive: true } },
              },
            },
            variant: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  static async getBySlug(slug: string) {
    const config = await prisma.discoverySetConfig.findUnique({
      where: { slug },
      include: {
        eligibleItems: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                variants: { where: { isActive: true } },
                referenceBrand: true,
              },
            },
            variant: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        prebuiltItems: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
                variants: { where: { isActive: true } },
                referenceBrand: true,
              },
            },
            variant: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!config || config.status !== DiscoverySetStatus.ACTIVE) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Discovery set not found or inactive.' };
    }

    return config;
  }

  /**
   * Server-side pricing & eligibility validation
   */
  static async validateAndPriceSelection(slug: string, selectionVariantIds: string[]) {
    const setConfig = await prisma.discoverySetConfig.findUnique({
      where: { slug },
      include: {
        eligibleItems: true,
      },
    });

    if (!setConfig || setConfig.status !== DiscoverySetStatus.ACTIVE) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Discovery set configuration not found.' };
    }

    if (!selectionVariantIds || !Array.isArray(selectionVariantIds)) {
      throw { statusCode: 400, code: 'INVALID_SELECTION', message: 'Selection items must be an array of variant IDs.' };
    }

    if (
      selectionVariantIds.length < setConfig.minSelections ||
      selectionVariantIds.length > setConfig.maxSelections
    ) {
      throw {
        statusCode: 400,
        code: 'INVALID_ITEM_COUNT',
        message: `Please select exactly between ${setConfig.minSelections} and ${setConfig.maxSelections} fragrances.`,
      };
    }

    if (!setConfig.allowDuplicates) {
      const uniqueIds = new Set(selectionVariantIds);
      if (uniqueIds.size !== selectionVariantIds.length) {
        throw { statusCode: 400, code: 'DUPLICATES_NOT_ALLOWED', message: 'Duplicate fragrances are not allowed in this set.' };
      }
    }

    // Load actual variants from database with stock validation
    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: selectionVariantIds },
        isActive: true,
        product: { status: 'ACTIVE' },
      },
      include: {
        product: {
          include: {
            images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
          },
        },
      },
    });

    if (variants.length !== selectionVariantIds.length) {
      throw { statusCode: 400, code: 'INVALID_VARIANT', message: 'One or more selected fragrances are unavailable.' };
    }

    // Verify in-stock
    for (const v of variants) {
      if (v.stockQuantity <= 0) {
        throw {
          statusCode: 400,
          code: 'OUT_OF_STOCK',
          message: `${v.product.name} (${v.sizeLabel}) is currently out of stock.`,
        };
      }
    }

    // Calculate bundle price
    let calculatedPrice = 0;
    if (setConfig.pricingMode === DiscoverySetPricingMode.FIXED) {
      calculatedPrice = Number(setConfig.fixedPrice || 0);
    } else if (setConfig.pricingMode === DiscoverySetPricingMode.SUM) {
      calculatedPrice = variants.reduce((sum, v) => sum + Number(v.price), 0);
    } else if (setConfig.pricingMode === DiscoverySetPricingMode.DISCOUNTED_SUM) {
      const sum = variants.reduce((sum, v) => sum + Number(v.price), 0);
      const discount = (Number(setConfig.discountPercent || 0) / 100) * sum;
      calculatedPrice = Math.max(0, sum - discount);
    }

    const selectionsSnapshot = variants.map((v) => ({
      variantId: v.id,
      productId: v.productId,
      productName: v.product.name,
      sizeLabel: v.sizeLabel,
      price: Number(v.price),
      imageUrl: v.product.images[0]?.url || null,
    }));

    return {
      configId: setConfig.id,
      name: setConfig.name,
      title: setConfig.title,
      price: calculatedPrice,
      selections: selectionsSnapshot,
    };
  }

  // ==========================================
  // ADMIN SERVICES
  // ==========================================
  static async listAdmin() {
    return prisma.discoverySetConfig.findMany({
      include: {
        eligibleItems: {
          include: { product: true, variant: true },
        },
        prebuiltItems: {
          include: { product: true, variant: true },
        },
        _count: { select: { cartItems: true, orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async create(input: CreateDiscoverySetInput) {
    return prisma.discoverySetConfig.create({
      data: {
        name: input.name,
        slug: input.slug,
        type: input.type || DiscoverySetType.CUSTOM,
        status: input.status || DiscoverySetStatus.ACTIVE,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        imageUrl: input.imageUrl,
        selectionMode: input.selectionMode || DiscoverySetSelectionMode.PRODUCT,
        minSelections: input.minSelections || 3,
        maxSelections: input.maxSelections || 3,
        pricingMode: input.pricingMode || DiscoverySetPricingMode.FIXED,
        fixedPrice: input.fixedPrice,
        discountPercent: input.discountPercent,
        allowDuplicates: input.allowDuplicates || false,
        maxPerOrder: input.maxPerOrder || 5,
        sortOrder: input.sortOrder || 0,
        isFeatured: input.isFeatured || false,
      },
    });
  }

  static async update(id: string, input: Partial<CreateDiscoverySetInput>) {
    return prisma.discoverySetConfig.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        type: input.type,
        status: input.status,
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        imageUrl: input.imageUrl,
        selectionMode: input.selectionMode,
        minSelections: input.minSelections,
        maxSelections: input.maxSelections,
        pricingMode: input.pricingMode,
        fixedPrice: input.fixedPrice,
        discountPercent: input.discountPercent,
        allowDuplicates: input.allowDuplicates,
        maxPerOrder: input.maxPerOrder,
        sortOrder: input.sortOrder,
        isFeatured: input.isFeatured,
      },
    });
  }

  static async delete(id: string) {
    return prisma.discoverySetConfig.delete({ where: { id } });
  }
}
