import { prisma } from '../../utils/prisma.js';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.validation.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class CategoriesService {
  static async listCategories(adminMode = false) {
    return prisma.category.findMany({
      where: adminMode ? {} : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  static async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw { statusCode: 404, code: 'CATEGORY_NOT_FOUND', message: 'Category not found.' };
    }
    return category;
  }

  static async createCategory(input: CreateCategoryInput) {
    const slug = input.slug || slugify(input.name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw { statusCode: 400, code: 'SLUG_EXISTS', message: `Category with slug "${slug}" already exists.` };
    }

    return prisma.category.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        imageUrl: input.imageUrl,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  static async updateCategory(id: string, input: UpdateCategoryInput) {
    await this.getCategoryById(id);

    let slug = input.slug;
    if (input.name && !slug) {
      slug = slugify(input.name);
    }

    if (slug) {
      const existing = await prisma.category.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existing) {
        throw { statusCode: 400, code: 'SLUG_EXISTS', message: `Category with slug "${slug}" already exists.` };
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(slug ? { slug } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
  }

  static async deleteCategory(id: string) {
    await this.getCategoryById(id);

    const productCount = await prisma.productCategory.count({ where: { categoryId: id } });
    if (productCount > 0) {
      // Deactivate instead of hard delete if referenced by products
      return prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return prisma.category.delete({ where: { id } });
  }
}
