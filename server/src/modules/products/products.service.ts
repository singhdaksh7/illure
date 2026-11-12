import { prisma } from '../../utils/prisma.js';
import {
  CreateProductInput,
  UpdateProductInput,
  AdminProductsQueryInput,
  PublicProductsQueryInput,
} from './products.validation.js';
import { ProductStatus, InventoryMovementType } from '@prisma/client';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class ProductsService {
  // ==========================================
  // ADMIN PRODUCT SERVICES
  // ==========================================

  static async listAdminProducts(query: AdminProductsQueryInput) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.gender) {
      where.gender = query.gender;
    }

    if (query.referenceBrandId) {
      where.referenceBrandId = query.referenceBrandId;
    }

    if (query.categoryId) {
      where.productCategories = {
        some: { categoryId: query.categoryId },
      };
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { inspiredByName: { contains: s, mode: 'insensitive' } },
        { fragranceFamily: { contains: s, mode: 'insensitive' } },
        { referenceBrand: { name: { contains: s, mode: 'insensitive' } } },
        { variants: { some: { sku: { contains: s, mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          referenceBrand: { select: { id: true, name: true, slug: true } },
          productCategories: {
            include: { category: { select: { id: true, name: true, slug: true } } },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          },
          variants: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    // Format products for admin table
    const formattedItems = items.map((p) => {
      const prices = p.variants.map((v) => Number(v.price));
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const totalStock = p.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

      return {
        ...p,
        minPrice,
        maxPrice,
        totalStock,
        variantsCount: p.variants.length,
        categories: p.productCategories.map((pc) => pc.category),
        primaryImage: p.images.find((img) => img.isPrimary) || p.images[0] || null,
      };
    });

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items: formattedItems,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        referenceBrand: true,
        productCategories: {
          include: { category: true },
        },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        variants: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) {
      throw { statusCode: 404, code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' };
    }

    return {
      ...product,
      categoryIds: product.productCategories.map((pc) => pc.categoryId),
      categories: product.productCategories.map((pc) => pc.category),
    };
  }

  static async createProduct(input: CreateProductInput, adminId?: string) {
    const slug = input.slug || slugify(input.name);

    // Slug uniqueness check
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      throw { statusCode: 400, code: 'SLUG_EXISTS', message: `Product with slug "${slug}" already exists.` };
    }

    // SKU uniqueness check
    const skus = input.variants.map((v) => v.sku);
    const existingSkus = await prisma.productVariant.findMany({
      where: { sku: { in: skus } },
      select: { sku: true },
    });
    if (existingSkus.length > 0) {
      throw {
        statusCode: 400,
        code: 'SKU_EXISTS',
        message: `The following SKU(s) already exist: ${existingSkus.map((s) => s.sku).join(', ')}`,
      };
    }

    return prisma.$transaction(async (tx) => {
      // Create Product
      const product = await tx.product.create({
        data: {
          name: input.name,
          slug,
          shortDescription: input.shortDescription,
          description: input.description,
          referenceBrandId: input.referenceBrandId,
          inspiredByName: input.inspiredByName,
          gender: input.gender,
          fragranceFamily: input.fragranceFamily,
          topNotes: input.topNotes,
          heartNotes: input.heartNotes,
          baseNotes: input.baseNotes,
          occasion: input.occasion,
          season: input.season,
          longevity: input.longevity,
          projection: input.projection,
          featured: input.featured,
          bestseller: input.bestseller,
          newArrival: input.newArrival,
          status: input.status,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
        },
      });

      // Assign Categories
      const categoryIds = input.categoryIds ?? [];
      if (categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId,
          })),
        });
      }

      // Create Variants & Initial Stock Movement
      const variants = input.variants ?? [];
      for (const v of variants) {
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sizeLabel: v.sizeLabel,
            sizeMl: v.sizeMl,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            costPrice: v.costPrice,
            stockQuantity: v.stockQuantity,
            lowStockThreshold: v.lowStockThreshold,
            isActive: v.isActive,
            sortOrder: v.sortOrder,
          },
        });

        if (v.stockQuantity > 0) {
          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              type: InventoryMovementType.PURCHASE,
              quantity: v.stockQuantity,
              reason: 'Initial stock setup on product creation',
              createdByAdminId: adminId,
            },
          });
        }
      }

      // Create Images
      const images = input.images ?? [];
      if (images.length > 0) {
        // Enforce at least one primary image
        const hasPrimary = images.some((img) => img.isPrimary);
        const imagesToCreate = images.map((img, idx) => ({
          productId: product.id,
          url: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder ?? idx,
          isPrimary: hasPrimary ? img.isPrimary : idx === 0,
        }));

        await tx.productImage.createMany({
          data: imagesToCreate,
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          referenceBrand: true,
          productCategories: { include: { category: true } },
          images: true,
          variants: true,
        },
      });
    });
  }

  static async updateProduct(id: string, input: UpdateProductInput, _adminId?: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' };
    }

    let slug = input.slug;
    if (input.name && !slug) {
      slug = slugify(input.name);
    }

    if (slug) {
      const existingSlug = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        throw { statusCode: 400, code: 'SLUG_EXISTS', message: `Product with slug "${slug}" already exists.` };
      }
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update basic product fields
      if (existing.slug && slug && existing.slug !== slug) {
        // Create 301 automatic redirect from old slug to new slug
        await tx.urlRedirect.upsert({
          where: { sourcePath: `/product/${existing.slug}` },
          create: {
            sourcePath: `/product/${existing.slug}`,
            targetPath: `/product/${slug}`,
            statusCode: 301,
            isActive: true,
          },
          update: {
            targetPath: `/product/${slug}`,
            statusCode: 301,
            isActive: true,
          },
        });
      }

      await tx.product.update({
        where: { id },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(slug ? { slug } : {}),
          ...(input.shortDescription !== undefined ? { shortDescription: input.shortDescription } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.referenceBrandId !== undefined ? { referenceBrandId: input.referenceBrandId } : {}),
          ...(input.inspiredByName !== undefined ? { inspiredByName: input.inspiredByName } : {}),
          ...(input.gender ? { gender: input.gender } : {}),
          ...(input.fragranceFamily !== undefined ? { fragranceFamily: input.fragranceFamily } : {}),
          ...(input.topNotes ? { topNotes: input.topNotes } : {}),
          ...(input.heartNotes ? { heartNotes: input.heartNotes } : {}),
          ...(input.baseNotes ? { baseNotes: input.baseNotes } : {}),
          ...(input.occasion !== undefined ? { occasion: input.occasion } : {}),
          ...(input.season !== undefined ? { season: input.season } : {}),
          ...(input.longevity !== undefined ? { longevity: input.longevity } : {}),
          ...(input.projection !== undefined ? { projection: input.projection } : {}),
          ...(input.featured !== undefined ? { featured: input.featured } : {}),
          ...(input.bestseller !== undefined ? { bestseller: input.bestseller } : {}),
          ...(input.newArrival !== undefined ? { newArrival: input.newArrival } : {}),
          ...(input.status ? { status: input.status } : {}),
          ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
          ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
        },
      });

      // 2. Update Categories if provided
      if (input.categoryIds !== undefined) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        if (input.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: input.categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            })),
          });
        }
      }

      // 3. Update Variants if provided
      if (input.variants !== undefined) {
        const incomingSkus = input.variants.map((v) => v.sku);
        const existingSkus = await tx.productVariant.findMany({
          where: { sku: { in: incomingSkus }, productId: { not: id } },
        });

        if (existingSkus.length > 0) {
          throw {
            statusCode: 400,
            code: 'SKU_EXISTS',
            message: `The following SKU(s) already exist on another product: ${existingSkus.map((s) => s.sku).join(', ')}`,
          };
        }

        // Upsert variants
        for (const v of input.variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                sizeLabel: v.sizeLabel,
                sizeMl: v.sizeMl,
                sku: v.sku,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                costPrice: v.costPrice,
                lowStockThreshold: v.lowStockThreshold,
                isActive: v.isActive,
                sortOrder: v.sortOrder,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                sizeLabel: v.sizeLabel,
                sizeMl: v.sizeMl,
                sku: v.sku,
                price: v.price,
                compareAtPrice: v.compareAtPrice,
                costPrice: v.costPrice,
                stockQuantity: v.stockQuantity || 0,
                lowStockThreshold: v.lowStockThreshold || 5,
                isActive: v.isActive ?? true,
                sortOrder: v.sortOrder || 0,
              },
            });
          }
        }
      }

      // 4. Update Images if provided
      if (input.images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (input.images.length > 0) {
          const hasPrimary = input.images.some((img) => img.isPrimary);
          await tx.productImage.createMany({
            data: input.images.map((img, idx) => ({
              productId: id,
              url: img.url,
              altText: img.altText,
              sortOrder: img.sortOrder ?? idx,
              isPrimary: hasPrimary ? img.isPrimary : idx === 0,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          referenceBrand: true,
          productCategories: { include: { category: true } },
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
          variants: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });
  }

  static async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { orderItems: { take: 1 } },
    });

    if (!existing) {
      throw { statusCode: 404, code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' };
    }

    // Soft Lifecycle Archive if referenced by orders or active
    if (existing.orderItems.length > 0 || existing.status === ProductStatus.ACTIVE) {
      return prisma.product.update({
        where: { id },
        data: { status: ProductStatus.ARCHIVED },
      });
    }

    // Otherwise hard delete draft
    return prisma.product.delete({ where: { id } });
  }

  // ==========================================
  // PUBLIC CUSTOMER CATALOG SERVICES
  // ==========================================

  static async listPublicProducts(query: PublicProductsQueryInput) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Public catalog exposes ONLY ACTIVE products
    const where: any = {
      status: ProductStatus.ACTIVE,
    };

    if (query.gender) {
      where.gender = query.gender;
    }

    if (query.featured) where.featured = true;
    if (query.bestseller) where.bestseller = true;
    if (query.newArrival) where.newArrival = true;

    if (query.category) {
      where.productCategories = {
        some: {
          category: {
            OR: [{ slug: query.category }, { id: query.category }],
          },
        },
      };
    }

    if (query.referenceBrand) {
      where.referenceBrand = {
        OR: [{ slug: query.referenceBrand }, { id: query.referenceBrand }],
      };
    }

    if (query.fragranceFamily) {
      where.fragranceFamily = { contains: query.fragranceFamily, mode: 'insensitive' };
    }

    if (query.occasion) {
      where.occasion = { contains: query.occasion, mode: 'insensitive' };
    }

    if (query.season) {
      where.season = { contains: query.season, mode: 'insensitive' };
    }

    if (query.note) {
      const n = query.note.trim();
      where.OR = [
        { topNotes: { has: n } },
        { heartNotes: { has: n } },
        { baseNotes: { has: n } },
      ];
    }

    if (query.search) {
      const s = query.search.replace(/[%_"'\\]/g, ' ').trim().slice(0, 80);
      if (s.length >= 2) {
        const searchConditions = [
          { name: { contains: s, mode: 'insensitive' } },
          { inspiredByName: { contains: s, mode: 'insensitive' } },
          { fragranceFamily: { contains: s, mode: 'insensitive' } },
          { referenceBrand: { name: { contains: s, mode: 'insensitive' } } },
          { topNotes: { has: s } },
          { heartNotes: { has: s } },
          { baseNotes: { has: s } },
          { occasion: { contains: s, mode: 'insensitive' } },
        ];

        if (where.OR) {
          where.AND = [
            { OR: where.OR },
            { OR: searchConditions },
          ];
          delete where.OR;
        } else {
          where.OR = searchConditions;
        }
      }
    }

    // Price range filters on variants
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.variants = {
        some: {
          isActive: true,
          price: {
            ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
            ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
          },
        },
      };
    }

    // Sort strategy
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'featured') {
      orderBy = [{ featured: 'desc' }, { bestseller: 'desc' }, { createdAt: 'desc' }];
    } else if (query.sort === 'name') {
      orderBy = { name: 'asc' };
    } else if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          referenceBrand: { select: { id: true, name: true, slug: true } },
          productCategories: {
            include: { category: { select: { id: true, name: true, slug: true } } },
          },
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          },
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              sizeLabel: true,
              sizeMl: true,
              sku: true,
              price: true,
              compareAtPrice: true,
              stockQuantity: true,
              lowStockThreshold: true,
              sortOrder: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    // Format for customer view (strip sensitive costPrice / admin fields)
    const formattedItems = items.map((p) => {
      const prices = p.variants.map((v) => Number(v.price));
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const inStock = p.variants.some((v) => v.stockQuantity > 0);

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        inspiredByName: p.inspiredByName,
        referenceBrand: p.referenceBrand,
        gender: p.gender,
        fragranceFamily: p.fragranceFamily,
        topNotes: p.topNotes,
        heartNotes: p.heartNotes,
        baseNotes: p.baseNotes,
        occasion: p.occasion,
        season: p.season,
        longevity: p.longevity,
        projection: p.projection,
        featured: p.featured,
        bestseller: p.bestseller,
        newArrival: p.newArrival,
        minPrice,
        maxPrice,
        inStock,
        categories: p.productCategories.map((pc) => pc.category),
        primaryImage: p.images.find((img) => img.isPrimary) || p.images[0] || null,
        images: p.images,
        variants: p.variants.map((v) => ({
          ...v,
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          inStock: v.stockQuantity > 0,
        })),
      };
    });

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items: formattedItems,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  static async getPublicProductBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, status: ProductStatus.ACTIVE },
      include: {
        referenceBrand: { select: { id: true, name: true, slug: true, description: true } },
        productCategories: {
          include: { category: { select: { id: true, name: true, slug: true } } },
        },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            sizeLabel: true,
            sizeMl: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            stockQuantity: true,
            lowStockThreshold: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!product) {
      throw { statusCode: 404, code: 'PRODUCT_NOT_FOUND', message: 'Product not found or currently unavailable.' };
    }

    const prices = product.variants.map((v) => Number(v.price));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const inStock = product.variants.some((v) => v.stockQuantity > 0);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      inspiredByName: product.inspiredByName,
      referenceBrand: product.referenceBrand,
      gender: product.gender,
      fragranceFamily: product.fragranceFamily,
      topNotes: product.topNotes,
      heartNotes: product.heartNotes,
      baseNotes: product.baseNotes,
      occasion: product.occasion,
      season: product.season,
      longevity: product.longevity,
      projection: product.projection,
      featured: product.featured,
      bestseller: product.bestseller,
      newArrival: product.newArrival,
      minPrice,
      maxPrice,
      inStock,
      categories: product.productCategories.map((pc) => pc.category),
      primaryImage: product.images.find((img) => img.isPrimary) || product.images[0] || null,
      images: product.images,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        inStock: v.stockQuantity > 0,
        lowStock: v.stockQuantity <= v.lowStockThreshold,
      })),
      seoTitle: product.seoTitle || product.name,
      seoDescription: product.seoDescription || product.shortDescription,
    };
  }

  static async getCatalogFacets() {
    const products = await prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
      select: {
        fragranceFamily: true,
        gender: true,
        occasion: true,
        season: true,
        topNotes: true,
        heartNotes: true,
        baseNotes: true,
        variants: {
          where: { isActive: true },
          select: { price: true, sizeLabel: true, stockQuantity: true },
        },
      },
    });

    const familiesSet = new Set<string>();
    const occasionsSet = new Set<string>();
    const seasonsSet = new Set<string>();
    const notesSet = new Set<string>();
    const sizesSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const p of products) {
      if (p.fragranceFamily) familiesSet.add(p.fragranceFamily);
      if (p.occasion) occasionsSet.add(p.occasion);
      if (p.season) seasonsSet.add(p.season);
      (p.topNotes || []).forEach((n) => notesSet.add(n));
      (p.heartNotes || []).forEach((n) => notesSet.add(n));
      (p.baseNotes || []).forEach((n) => notesSet.add(n));

      for (const v of p.variants) {
        const pr = Number(v.price);
        if (pr < minPrice) minPrice = pr;
        if (pr > maxPrice) maxPrice = pr;
        if (v.sizeLabel) sizesSet.add(v.sizeLabel);
      }
    }

    return {
      families: Array.from(familiesSet).sort(),
      occasions: Array.from(occasionsSet).sort(),
      seasons: Array.from(seasonsSet).sort(),
      notes: Array.from(notesSet).sort(),
      sizes: Array.from(sizesSet).sort(),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice,
      },
    };
  }

  static async advancedSearch(query: string) {
    const clean = (query || '').replace(/[%_"'\-]/g, ' ').trim().slice(0, 80);
    const keywords = clean.split(/\s+/).filter((k) => k.length >= 2);
    if (keywords.length === 0) {
      return { fragrances: [], notes: [], families: [] };
    }
    const q = keywords[0];
    const products = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { inspiredByName: { contains: q, mode: 'insensitive' } },
          { fragranceFamily: { contains: q, mode: 'insensitive' } },
          { referenceBrand: { name: { contains: q, mode: 'insensitive' } } },
          { topNotes: { has: q } },
          { heartNotes: { has: q } },
          { baseNotes: { has: q } },
          { occasion: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1,
          select: { price: true, sizeLabel: true, stockQuantity: true },
        },
      },
      take: 8,
    });

    const allProducts = await prisma.product.findMany({
      where: { status: ProductStatus.ACTIVE },
      select: { topNotes: true, heartNotes: true, baseNotes: true, fragranceFamily: true },
    });

    const matchingNotes = new Set<string>();
    const matchingFamilies = new Set<string>();
    const lowerQ = q.toLowerCase();

    for (const p of allProducts) {
      if (p.fragranceFamily && p.fragranceFamily.toLowerCase().includes(lowerQ)) {
        matchingFamilies.add(p.fragranceFamily);
      }
      for (const n of [...(p.topNotes || []), ...(p.heartNotes || []), ...(p.baseNotes || [])]) {
        if (n.toLowerCase().includes(lowerQ)) {
          matchingNotes.add(n);
        }
      }
    }

    const formattedFragrances = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      inspiredByName: p.inspiredByName,
      fragranceFamily: p.fragranceFamily,
      primaryImage: p.images[0]?.url || null,
      startingPrice: p.variants[0] ? Number(p.variants[0].price) : null,
      sizeLabel: p.variants[0]?.sizeLabel || null,
      inStock: p.variants.some((v) => v.stockQuantity > 0),
    }));

    return {
      fragrances: formattedFragrances,
      notes: Array.from(matchingNotes).slice(0, 6),
      families: Array.from(matchingFamilies).slice(0, 4),
    };
  }

  /**
   * Duplicate an existing product with its variants, images, and categories
   */
  static async duplicateProduct(id: string, _adminId?: string) {
    const source = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
        productCategories: true,
      },
    });

    if (!source) {
      throw { statusCode: 404, code: 'PRODUCT_NOT_FOUND', message: 'Product to duplicate not found.' };
    }

    const timestamp = Date.now().toString().slice(-4);
    const newName = `${source.name} (Copy ${timestamp})`;
    const newSlug = `${source.slug}-copy-${timestamp}`;

    return prisma.$transaction(async (tx) => {
      const duplicated = await tx.product.create({
        data: {
          name: newName,
          slug: newSlug,
          shortDescription: source.shortDescription,
          description: source.description,
          referenceBrandId: source.referenceBrandId,
          inspiredByName: source.inspiredByName,
          gender: source.gender,
          fragranceFamily: source.fragranceFamily,
          topNotes: source.topNotes,
          heartNotes: source.heartNotes,
          baseNotes: source.baseNotes,
          occasion: source.occasion,
          season: source.season,
          longevity: source.longevity,
          projection: source.projection,
          featured: false,
          bestseller: false,
          newArrival: false,
          status: 'DRAFT', // Safe draft state for duplicated products
          seoTitle: source.seoTitle ? `${source.seoTitle} (Copy)` : null,
          seoDescription: source.seoDescription,
        },
      });

      // Duplicate categories
      if (source.productCategories.length > 0) {
        await tx.productCategory.createMany({
          data: source.productCategories.map((pc) => ({
            productId: duplicated.id,
            categoryId: pc.categoryId,
          })),
        });
      }

      // Duplicate variants with new unique SKUs
      if (source.variants.length > 0) {
        await tx.productVariant.createMany({
          data: source.variants.map((v, i) => ({
            productId: duplicated.id,
            sizeLabel: v.sizeLabel,
            sizeMl: v.sizeMl,
            sku: `${v.sku}-COPY-${timestamp}-${i + 1}`,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            costPrice: v.costPrice,
            stockQuantity: 0, // Reset inventory to 0 on duplicate for safety
            lowStockThreshold: v.lowStockThreshold,
            isActive: v.isActive,
            sortOrder: v.sortOrder,
          })),
        });
      }

      // Duplicate images
      if (source.images.length > 0) {
        await tx.productImage.createMany({
          data: source.images.map((img) => ({
            productId: duplicated.id,
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: duplicated.id },
        include: {
          referenceBrand: true,
          productCategories: { include: { category: true } },
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
          variants: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });
  }
}

