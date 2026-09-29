import { z } from 'zod';
import { Gender, ProductStatus } from '@prisma/client';

export const variantInputSchema = z.object({
  id: z.string().optional(),
  sizeLabel: z.string().min(1, 'Size label is required').transform((val) => val.trim()),
  sizeMl: z.number().positive().optional().nullable(),
  sku: z.string().min(1, 'SKU is required').transform((val) => val.trim().toUpperCase()),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const imageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().url('Invalid image URL'),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').transform((val) => val.trim()),
  slug: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toLowerCase() : undefined)),
  shortDescription: z.string().optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  referenceBrandId: z.string().optional().nullable(),
  inspiredByName: z.string().optional().nullable(),
  gender: z.nativeEnum(Gender).default(Gender.UNISEX),
  fragranceFamily: z.string().optional().nullable(),
  topNotes: z.array(z.string()).default([]),
  heartNotes: z.array(z.string()).default([]),
  baseNotes: z.array(z.string()).default([]),
  occasion: z.string().optional().nullable(),
  season: z.string().optional().nullable(),
  longevity: z.string().optional().nullable(),
  projection: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).default([]),
  variants: z.array(variantInputSchema).min(1, 'At least one product variant is required'),
  images: z.array(imageInputSchema).default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const adminProductsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  categoryId: z.string().optional(),
  referenceBrandId: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const publicProductsQuerySchema = z.object({
  gender: z.nativeEnum(Gender).optional(),
  category: z.string().optional(),
  referenceBrand: z.string().optional(),
  fragranceFamily: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  bestseller: z.coerce.boolean().optional(),
  newArrival: z.coerce.boolean().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['featured', 'newest', 'price-low-high', 'price-high-low', 'name']).default('featured'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdminProductsQueryInput = z.infer<typeof adminProductsQuerySchema>;
export type PublicProductsQueryInput = z.infer<typeof publicProductsQuerySchema>;
