import { prisma } from '../../utils/prisma.js';

export interface UpdateShippingInput {
  flatRate?: number;
  freeShippingThreshold?: number;
  isEnabled?: boolean;
}

export class SettingsService {
  static async getShippingSettings() {
    let setting = await prisma.shippingSetting.findFirst();

    if (!setting) {
      setting = await prisma.shippingSetting.create({
        data: {
          flatRate: 99.00,
          freeShippingThreshold: 999.00,
          isEnabled: true,
        },
      });
    }

    return {
      id: setting.id,
      flatRate: Number(setting.flatRate),
      freeShippingThreshold: Number(setting.freeShippingThreshold),
      isEnabled: setting.isEnabled,
      updatedAt: setting.updatedAt,
    };
  }

  static async updateShippingSettings(input: UpdateShippingInput) {
    const current = await this.getShippingSettings();

    const updated = await prisma.shippingSetting.update({
      where: { id: current.id },
      data: {
        ...(input.flatRate !== undefined && { flatRate: input.flatRate }),
        ...(input.freeShippingThreshold !== undefined && { freeShippingThreshold: input.freeShippingThreshold }),
        ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
      },
    });

    return {
      id: updated.id,
      flatRate: Number(updated.flatRate),
      freeShippingThreshold: Number(updated.freeShippingThreshold),
      isEnabled: updated.isEnabled,
      updatedAt: updated.updatedAt,
    };
  }
}
