import { prisma } from '../../utils/prisma.js';
import crypto from 'crypto';

export class CartService {
  static generateSessionKey(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  private static async getOrCreateCart(customerId?: string, sessionKey?: string) {
    if (customerId) {
      let cart = await prisma.cart.findUnique({
        where: { customerId },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { customerId },
        });
      }
      return cart;
    } else if (sessionKey) {
      let cart = await prisma.cart.findUnique({
        where: { sessionKey },
      });
      if (!cart) {
        cart = await prisma.cart.create({
          data: { sessionKey },
        });
      }
      return cart;
    }
    throw { statusCode: 400, code: 'BAD_REQUEST', message: 'Either customer authentication or session key is required.' };
  }

  static async getCart(customerId?: string, sessionKey?: string) {
    if (!customerId && !sessionKey) {
      return {
        id: null,
        items: [],
        subtotal: 0,
        itemCount: 0,
      };
    }

    const cart = await this.getOrCreateCart(customerId, sessionKey);

    const fullCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { isPrimary: 'desc' } },
                referenceBrand: true,
              },
            },
            variant: true,
            giftPackaging: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!fullCart) {
      return { id: null, items: [], subtotal: 0, itemCount: 0 };
    }

    let subtotal = 0;
    let itemCount = 0;

    const formattedItems = fullCart.items.map((item) => {
      const variantPrice = Number(item.variant.price);
      const giftPackagingPrice = item.giftPackaging ? Number(item.giftPackaging.price) : 0;
      const unitPrice = variantPrice + giftPackagingPrice;
      const lineTotal = unitPrice * item.quantity;

      subtotal += lineTotal;
      itemCount += item.quantity;

      const isVariantActive = item.variant.isActive && item.product.status === 'ACTIVE';
      const isAvailable = isVariantActive && item.variant.stockQuantity >= item.quantity;

      let stockState: 'IN_STOCK' | 'LOW_STOCK' | 'SOLD_OUT' = 'IN_STOCK';
      if (item.variant.stockQuantity <= 0) {
        stockState = 'SOLD_OUT';
      } else if (item.variant.stockQuantity <= item.variant.lowStockThreshold) {
        stockState = 'LOW_STOCK';
      }

      const primaryImage = item.product.images.find((img) => img.isPrimary) || item.product.images[0];

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        inspiredByName: item.product.inspiredByName,
        referenceBrandName: item.product.referenceBrand?.name || null,
        primaryImage: primaryImage?.url || null,
        variantId: item.variantId,
        sizeLabel: item.variant.sizeLabel,
        sku: item.variant.sku,
        stockQuantity: item.variant.stockQuantity,
        stockState,
        quantity: item.quantity,
        variantPrice,
        giftPackagingId: item.giftPackagingId,
        giftPackagingName: item.giftPackaging?.name || null,
        giftPackagingPrice,
        unitPrice,
        lineTotal,
        giftMessage: item.giftMessage,
        isAvailable,
      };
    });

    return {
      id: fullCart.id,
      customerId: fullCart.customerId,
      sessionKey: fullCart.sessionKey,
      items: formattedItems,
      subtotal,
      itemCount,
    };
  }

  static async addItem(
    customerId: string | undefined,
    sessionKey: string | undefined,
    data: { variantId: string; quantity: number; giftPackagingId?: string | null; giftMessage?: string | null }
  ) {
    const cart = await this.getOrCreateCart(customerId, sessionKey);

    const variant = await prisma.productVariant.findUnique({
      where: { id: data.variantId },
      include: { product: true },
    });

    if (!variant || !variant.isActive || variant.product.status !== 'ACTIVE') {
      throw { statusCode: 400, code: 'INVALID_VARIANT', message: 'Selected product variant is inactive or unavailable.' };
    }

    if (data.giftPackagingId) {
      const packaging = await prisma.giftPackaging.findUnique({
        where: { id: data.giftPackagingId },
      });
      if (!packaging || !packaging.isActive) {
        throw { statusCode: 400, code: 'INVALID_PACKAGING', message: 'Selected gift packaging option is unavailable.' };
      }
    }

    const giftPackagingId = data.giftPackagingId || null;
    const giftMessage = data.giftMessage ? data.giftMessage.trim() : null;

    // Check for existing cart item with same variant, gift packaging, and gift message
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: variant.id,
        giftPackagingId,
        giftMessage,
      },
    });

    const targetQuantity = (existingItem ? existingItem.quantity : 0) + data.quantity;

    if (targetQuantity > variant.stockQuantity) {
      throw {
        statusCode: 400,
        code: 'INSUFFICIENT_STOCK',
        message: `Cannot add ${data.quantity} items. Maximum available stock for ${variant.sizeLabel} is ${variant.stockQuantity}.`,
      };
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: targetQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: variant.productId,
          variantId: variant.id,
          quantity: data.quantity,
          giftPackagingId,
          giftMessage,
        },
      });
    }

    return this.getCart(customerId, sessionKey);
  }

  static async updateItem(
    customerId: string | undefined,
    sessionKey: string | undefined,
    itemId: string,
    data: { quantity?: number; giftPackagingId?: string | null; giftMessage?: string | null }
  ) {
    const cart = await this.getOrCreateCart(customerId, sessionKey);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    });

    if (!item) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Cart item not found.' };
    }

    if (data.giftPackagingId) {
      const packaging = await prisma.giftPackaging.findUnique({
        where: { id: data.giftPackagingId },
      });
      if (!packaging || !packaging.isActive) {
        throw { statusCode: 400, code: 'INVALID_PACKAGING', message: 'Selected gift packaging option is unavailable.' };
      }
    }

    const newQuantity = data.quantity !== undefined ? data.quantity : item.quantity;

    if (newQuantity > item.variant.stockQuantity) {
      throw {
        statusCode: 400,
        code: 'INSUFFICIENT_STOCK',
        message: `Stock limit exceeded. Maximum available stock for ${item.variant.sizeLabel} is ${item.variant.stockQuantity}.`,
      };
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        ...(data.quantity !== undefined && { quantity: newQuantity }),
        ...(data.giftPackagingId !== undefined && { giftPackagingId: data.giftPackagingId || null }),
        ...(data.giftMessage !== undefined && { giftMessage: data.giftMessage ? data.giftMessage.trim() : null }),
      },
    });

    return this.getCart(customerId, sessionKey);
  }

  static async removeItem(customerId: string | undefined, sessionKey: string | undefined, itemId: string) {
    const cart = await this.getOrCreateCart(customerId, sessionKey);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Cart item not found.' };
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(customerId, sessionKey);
  }

  static async clearCart(customerId?: string, sessionKey?: string) {
    const cart = await this.getOrCreateCart(customerId, sessionKey);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(customerId, sessionKey);
  }

  static async mergeCart(customerId: string, sessionKey: string) {
    if (!sessionKey) return this.getCart(customerId, undefined);

    const guestCart = await prisma.cart.findUnique({
      where: { sessionKey },
      include: { items: { include: { variant: true } } },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getCart(customerId, undefined);
    }

    const customerCart = await this.getOrCreateCart(customerId, undefined);

    for (const guestItem of guestCart.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: customerCart.id,
          variantId: guestItem.variantId,
          giftPackagingId: guestItem.giftPackagingId,
          giftMessage: guestItem.giftMessage,
        },
      });

      const maxStock = guestItem.variant.stockQuantity;
      if (existingItem) {
        const mergedQty = Math.min(existingItem.quantity + guestItem.quantity, maxStock);
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: mergedQty },
        });
      } else {
        const itemQty = Math.min(guestItem.quantity, maxStock);
        if (itemQty > 0) {
          await prisma.cartItem.create({
            data: {
              cartId: customerCart.id,
              productId: guestItem.productId,
              variantId: guestItem.variantId,
              quantity: itemQty,
              giftPackagingId: guestItem.giftPackagingId,
              giftMessage: guestItem.giftMessage,
            },
          });
        }
      }
    }

    // Delete guest cart
    await prisma.cart.delete({
      where: { id: guestCart.id },
    });

    return this.getCart(customerId, undefined);
  }
}
