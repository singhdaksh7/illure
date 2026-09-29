import { prisma } from '../../utils/prisma.js';
import { CreateGiftPackagingInput, UpdateGiftPackagingInput } from './giftPackaging.validation.js';

export class GiftPackagingService {
  static async listGiftPackaging(adminMode = false) {
    return prisma.giftPackaging.findMany({
      where: adminMode ? {} : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  static async getById(id: string) {
    const pkg = await prisma.giftPackaging.findUnique({ where: { id } });
    if (!pkg) {
      throw { statusCode: 404, code: 'PACKAGING_NOT_FOUND', message: 'Gift packaging option not found.' };
    }
    return pkg;
  }

  static async createGiftPackaging(input: CreateGiftPackagingInput) {
    return prisma.giftPackaging.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        imageUrl: input.imageUrl,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  static async updateGiftPackaging(id: string, input: UpdateGiftPackagingInput) {
    await this.getById(id);

    return prisma.giftPackaging.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });
  }

  static async deleteGiftPackaging(id: string) {
    await this.getById(id);
    return prisma.giftPackaging.delete({ where: { id } });
  }
}
