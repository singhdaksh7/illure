import { prisma } from '../../utils/prisma.js';
import { IntegrationsService } from '../integrations/integrations.service.js';
import { ShipmentStatus, OrderStatus } from '@prisma/client';

export interface CreateShipmentInput {
  orderId: string;
  weightGrams?: number;
  lengthCm?: number;
  breadthCm?: number;
  heightCm?: number;
}

export class ShiprocketService {
  /**
   * Get Shiprocket Auth Token either from memory cache or by logging in with stored credentials
   */
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  static async getToken(): Promise<string | null> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.token;
    }

    const integration = await IntegrationsService.getDecryptedCredentials('SHIPROCKET');
    if (!integration || !integration.isEnabled || !integration.credentials.email || !integration.credentials.password) {
      return null;
    }

    try {
      const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: integration.credentials.email,
          password: integration.credentials.password,
        }),
      });

      if (!res.ok) return null;
      const data: any = await res.json();
      if (data?.token) {
        // Tokens are typically valid for 10 days; cache for 8 days
        this.cachedToken = {
          token: data.token,
          expiresAt: Date.now() + 8 * 24 * 60 * 60 * 1000,
        };
        return data.token;
      }
    } catch (err) {
      console.error('[ShiprocketService] Auth error:', err);
    }
    return null;
  }

  /**
   * Check delivery pincode serviceability
   */
  static async checkServiceability(deliveryPincode: string, pickupPincode?: string, weightKg = 0.5, cod = 0) {
    const token = await this.getToken();
    if (!token) {
      // Check if a manual pincode rule exists in DB
      const manualRule = await prisma.pincodeRule.findUnique({
        where: { pincode: deliveryPincode },
      });

      if (manualRule) {
        return {
          status: 'MANUAL_RULE_ACTIVE',
          isServiceable: manualRule.isServiceable,
          isCodAllowed: manualRule.isCodAllowed,
          estimatedDays: manualRule.estimatedDays || null,
          city: manualRule.city || null,
          state: manualRule.state || null,
          message: manualRule.isServiceable ? 'Serviceable via manual pincode rule.' : 'Pincode marked unserviceable.',
        };
      }

      return {
        status: 'CONFIGURATION_REQUIRED',
        message: 'Shiprocket credentials not configured or inactive. No manual pincode rule found.',
        isServiceable: null, // Truthful unknown status
      };
    }

    const integration = await IntegrationsService.getDecryptedCredentials('SHIPROCKET');
    const defaultPickup = pickupPincode || integration?.settings?.pickupPincode || '110001';

    try {
      const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${defaultPickup}&delivery_postcode=${deliveryPincode}&weight=${weightKg}&cod=${cod}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: any = await res.json();

      if (res.ok && data?.status === 200) {
        const couriers = data?.data?.available_courier_companies || [];
        return {
          status: 'SUCCESS',
          isServiceable: couriers.length > 0,
          couriers: couriers.map((c: any) => ({
            id: c.courier_company_id,
            name: c.courier_name,
            rate: c.rate,
            etd: c.etd,
          })),
        };
      }
      return {
        status: 'FAILED',
        isServiceable: false,
        message: data?.message || 'Pincode not serviceable.',
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        isServiceable: false,
        message: err?.message,
      };
    }
  }

  /**
   * Create a shipment in Shiprocket for an Order
   */
  static async createOrderShipment(input: CreateShipmentInput) {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        items: true,
        customer: true,
        shippingAddress: true,
        payments: true,
      },
    });

    if (!order) {
      throw { statusCode: 404, code: 'ORDER_NOT_FOUND', message: 'Order not found.' };
    }

    const token = await this.getToken();
    if (!token) {
      return {
        status: 'CONFIGURATION_REQUIRED',
        message: 'Shiprocket integration credentials required. Manual fulfillment pending.',
      };
    }

    const integration = await IntegrationsService.getDecryptedCredentials('SHIPROCKET');
    const shippingAddress: any = order.shippingAddress || {};
    const pickupLocation = integration?.settings?.pickupLocationName || 'Primary Warehouse';
    const isCod = order.payments.some((p) => p.provider === 'COD');

    const payload = {
      order_id: order.id,
      order_date: order.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      pickup_location: pickupLocation,
      billing_customer_name: order.customerName || order.customer?.name || shippingAddress.fullName || 'Valued Customer',
      billing_last_name: '',
      billing_address: shippingAddress.addressLine1 || shippingAddress.address || 'Address',
      billing_city: shippingAddress.city || 'City',
      billing_pincode: shippingAddress.pincode || shippingAddress.postalCode || '110001',
      billing_state: shippingAddress.state || 'State',
      billing_country: shippingAddress.country || 'India',
      billing_email: order.customerEmail || order.customer?.email || 'customer@illurefragrance.com',
      billing_phone: order.customerPhone || shippingAddress.phone || '9999999999',
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.productName || 'Fragrance',
        sku: item.sku || `SKU-${item.id.slice(0, 8)}`,
        units: item.quantity,
        selling_price: Number(item.unitPrice),
      })),
      payment_method: isCod ? 'COD' : 'Prepaid',
      sub_total: Number(order.totalAmount),
      length: input.lengthCm || 10,
      breadth: input.breadthCm || 10,
      height: input.heightCm || 10,
      weight: (input.weightGrams || 500) / 1000,
    };

    try {
      const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data: any = await res.json();

      if (res.ok && (data?.order_id || data?.shipment_id)) {
        const shipmentId = String(data.shipment_id || data.order_id);
        const awbCode = data.awb_code || null;

        // Persist shipment record
        const shipment = await prisma.shipment.create({
          data: {
            orderId: order.id,
            provider: 'SHIPROCKET',
            courierName: data.courier_name || 'Shiprocket Partner',
            shipmentId,
            awb: awbCode,
            trackingUrl: awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null,
            status: ShipmentStatus.READY_TO_SHIP,
            rawMetadata: data,
          },
        });

        // Add to order history
        await prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            oldStatus: order.status,
            newStatus: OrderStatus.PROCESSING,
            note: `Shipment booked with Shiprocket (Shipment ID: ${shipmentId}${awbCode ? `, AWB: ${awbCode}` : ''}).`,
          },
        });

        return {
          status: 'SUCCESS',
          shipment,
        };
      }

      return {
        status: 'FAILED',
        message: data?.message || 'Failed to create Shiprocket shipment.',
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        message: err?.message,
      };
    }
  }

  /**
   * Neutral Webhook Receiver for shipping events
   * Secure endpoint: /api/webhooks/shipping/receive
   */
  static async handleWebhook(headers: Record<string, any>, payload: any) {
    const integration = await IntegrationsService.getDecryptedCredentials('SHIPROCKET');
    const expectedSecret = integration?.credentials?.webhookSecret || process.env.SHIPPING_WEBHOOK_SECRET;

    const signature = headers['x-api-key'] || headers['x-shiprocket-signature'] || headers['authorization'];

    // Verify secret if configured
    if (expectedSecret && signature !== expectedSecret && !signature?.includes(expectedSecret)) {
      await prisma.webhookLog.create({
        data: {
          provider: 'SHIPROCKET',
          eventType: payload?.current_status || 'UNKNOWN',
          payload,
          status: 'FAILED',
          error: 'Invalid webhook security token.',
        },
      });
      throw { statusCode: 401, code: 'UNAUTHORIZED_WEBHOOK', message: 'Webhook signature verification failed.' };
    }

    const eventType = payload?.current_status || payload?.event || 'STATUS_UPDATE';
    const awb = payload?.awb || payload?.awb_code;
    const orderId = payload?.order_id;

    // Log raw webhook
    const log = await prisma.webhookLog.create({
      data: {
        provider: 'SHIPROCKET',
        eventType,
        payload,
        status: 'PROCESSED',
      },
    });

    if (awb || orderId) {
      // Find matching shipment
      const shipment = await prisma.shipment.findFirst({
        where: {
          OR: [
            ...(awb ? [{ awb: String(awb) }] : []),
            ...(orderId ? [{ shipmentId: String(orderId) }] : []),
          ],
        },
      });

      if (shipment) {
        let newStatus: ShipmentStatus = shipment.status;
        const normalized = String(eventType).toUpperCase();

        if (normalized.includes('TRANSIT') || normalized.includes('PICKED UP')) {
          newStatus = ShipmentStatus.IN_TRANSIT;
        } else if (normalized.includes('OUT FOR DELIVERY')) {
          newStatus = ShipmentStatus.OUT_FOR_DELIVERY;
        } else if (normalized.includes('DELIVERED')) {
          newStatus = ShipmentStatus.DELIVERED;
        } else if (normalized.includes('RTO') || normalized.includes('RETURN')) {
          newStatus = ShipmentStatus.RTO;
        }

        await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            status: newStatus,
            rawMetadata: payload,
          },
        });

        // If delivered, update order status
        if (newStatus === ShipmentStatus.DELIVERED) {
          const currentOrder = await prisma.order.findUnique({ where: { id: shipment.orderId } });
          if (currentOrder && currentOrder.status !== OrderStatus.DELIVERED) {
            await prisma.order.update({
              where: { id: shipment.orderId },
              data: { status: OrderStatus.DELIVERED },
            });

            await prisma.orderStatusHistory.create({
              data: {
                orderId: shipment.orderId,
                oldStatus: currentOrder.status,
                newStatus: OrderStatus.DELIVERED,
                note: `Shipment confirmed delivered via carrier webhook (AWB: ${awb}).`,
              },
            });
          }
        }
      }
    }

    return { received: true, status: 'processed', logId: log.id };
  }
}
