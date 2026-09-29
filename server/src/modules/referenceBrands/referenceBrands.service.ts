import { prisma } from '../../utils/prisma.js';
import { CreateReferenceBrandInput, UpdateReferenceBrandInput } from './referenceBrands.validation.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class ReferenceBrandsService {
  static async listBrands(adminMode = false) {
    return prisma.referenceBrand.findMany({
      where: adminMode ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  static async getBrandById(id: string) {
    const brand = await prisma.referenceBrand.findUnique({ where: { id } });
    if (!brand) {
      throw { statusCode: 404, code: 'BRAND_NOT_FOUND', message: 'Reference brand not found.' };
    }
    return brand;
  }

  static async createBrand(input: CreateReferenceBrandInput) {
    const slug = input.slug || slugify(input.name);

    const existing = await prisma.referenceBrand.findUnique({ where: { slug } });
    if (existing) {
      throw { statusCode: 400, code: 'SLUG_EXISTS', message: `Reference brand with slug "${slug}" already exists.` };
    }

    return prisma.referenceBrand.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        isActive: input.isActive ?? true,
      },
    });
  }

  static async updateBrand(id: string, input: UpdateReferenceBrandInput) {
    await this.getBrandById(id);

    let slug = input.slug;
    if (input.name && !slug) {
      slug = slugify(input.name);
    }

    if (slug) {
      const existing = await prisma.referenceBrand.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        throw { statusCode: 400, code: 'SLUG_EXISTS', message: `Reference brand with slug "${slug}" already exists.` };
      }
    }

    return prisma.referenceBrand.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(slug ? { slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  }

  static async deleteBrand(id: string) {
    await this.getBrandById(id);

    const productCount = await prisma.product.count({ where: { referenceBrandId: id } });
    if (productCount > 0) {
      // Deactivate instead of hard delete if referenced by products
      return prisma.referenceBrand.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return prisma.referenceBrand.delete({ where: { id } });
  }
}
