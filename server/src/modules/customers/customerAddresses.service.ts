import { prisma } from '../../utils/prisma.js';
import { normalizePhone } from './customerAuth.service.js';

export class CustomerAddressService {
  static async listAddresses(customerId: string) {
    return prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async createAddress(customerId: string, data: any) {
    const phone = normalizePhone(data.phone);
    const postalCode = data.postalCode.trim();

    const existingCount = await prisma.customerAddress.count({
      where: { customerId },
    });

    const shouldBeDefault = Boolean(data.isDefault) || existingCount === 0;

    if (shouldBeDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.customerAddress.create({
      data: {
        customerId,
        fullName: data.fullName,
        phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        postalCode,
        isDefault: shouldBeDefault,
      },
    });
  }

  static async updateAddress(customerId: string, addressId: string, data: any) {
    const address = await prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Address not found or unauthorized.' };
    }

    if (data.isDefault) {
      await prisma.customerAddress.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.customerAddress.update({
      where: { id: addressId },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phone && { phone: normalizePhone(data.phone) }),
        ...(data.addressLine1 && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
        ...(data.landmark !== undefined && { landmark: data.landmark }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.postalCode && { postalCode: data.postalCode.trim() }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  }

  static async deleteAddress(customerId: string, addressId: string) {
    const address = await prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Address not found or unauthorized.' };
    }

    await prisma.customerAddress.delete({ where: { id: addressId } });

    if (address.isDefault) {
      const remaining = await prisma.customerAddress.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await prisma.customerAddress.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Address deleted successfully.' };
  }

  static async setDefaultAddress(customerId: string, addressId: string) {
    const address = await prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Address not found or unauthorized.' };
    }

    await prisma.customerAddress.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    });

    return prisma.customerAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
