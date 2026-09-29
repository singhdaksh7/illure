import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(8, 'Phone number is required'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
});

export const checkoutSummarySchema = z.object({
  addressId: z.string().optional(),
  address: addressSchema.optional(),
  couponCode: z.string().optional(),
  sessionKey: z.string().optional(),
});

export const createOrderSchema = z.object({
  paymentMethod: z.enum(['COD', 'RAZORPAY']),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().min(8, 'Customer phone is required'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  addressId: z.string().optional(),
  address: addressSchema.optional(),
  couponCode: z.string().optional(),
  sessionKey: z.string().optional(),
});

export const razorpayVerifySchema = z.object({
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
  razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional(),
});

export const adminOrdersFilterSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  pageSize: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const guestLookupSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  emailOrPhone: z.string().min(1, 'Email or phone number is required'),
});
