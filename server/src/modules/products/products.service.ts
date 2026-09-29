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
      if (input.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: input.categoryIds.map((categoryId) => ({
            productId: product.id,
            categoryId,
          })),
        });
      }

      // Create Variants & Initial Stock Movement
      for (const v of input.variants) {
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
      if (input.images.length > 0) {
        // Enforce at least one primary image
        const hasPrimary = input.images.some((img) => img.isPrimary);
        const imagesToCreate = input.images.map((img, idx) => ({
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

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { inspiredByName: { contains: s, mode: 'insensitive' } },
        { fragranceFamily: { contains: s, mode: 'insensitive' } },
        { referenceBrand: { name: { contains: s, mode: 'insensitive' } } },
      ];
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
}
