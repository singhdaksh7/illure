import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
    });
  }
  return transporter;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productName: string;
    inspiredByName?: string | null;
    sizeLabel: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    giftPackagingName?: string | null;
    giftMessage?: string | null;
  }>;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  giftPackagingAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    postalCode: string;
  };
}

export class EmailService {
  static async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    if (!data.customerEmail) {
      return false;
    }

    const itemsHtml = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #2a2520;">
            <div style="font-weight: 600; color: #f5f0eb;">${item.productName}</div>
            ${item.inspiredByName ? `<div style="font-size: 12px; color: #c9a96e; font-style: italic;">Inspired by ${item.inspiredByName}</div>` : ''}
            <div style="font-size: 12px; color: #a39788;">Size: ${item.sizeLabel}</div>
            ${item.giftPackagingName ? `<div style="font-size: 12px; color: #c9a96e;">🎁 ${item.giftPackagingName}</div>` : ''}
            ${item.giftMessage ? `<div style="font-size: 12px; color: #d4c5b2; font-style: italic;">"${item.giftMessage}"</div>` : ''}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #2a2520; text-align: center; color: #e6dfd5;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #2a2520; text-align: right; color: #f5f0eb; font-weight: 600;">₹${item.lineTotal.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Cinzel', 'Playfair Display', Georgia, serif; background-color: #0b0a09; color: #e6dfd5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #141210; border: 1px solid #3a3227; padding: 30px; border-radius: 4px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #3a3227; }
          .logo { font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #c9a96e; text-transform: uppercase; margin-bottom: 5px; }
          .sub { font-size: 11px; letter-spacing: 2px; color: #a39788; text-transform: uppercase; }
          .title { font-size: 18px; color: #f5f0eb; margin: 25px 0 10px; text-align: center; }
          .order-badge { background: #262018; border: 1px solid #524331; color: #c9a96e; display: inline-block; padding: 6px 16px; font-size: 14px; font-weight: 600; letter-spacing: 1px; margin: 10px 0; border-radius: 2px; }
          .section { margin: 25px 0; }
          .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #c9a96e; border-bottom: 1px solid #2a2520; padding-bottom: 5px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #a39788; border-bottom: 1px solid #3a3227; }
          .totals-row td { padding: 6px 12px; }
          .grand-total td { font-weight: 700; font-size: 16px; color: #c9a96e; border-top: 1px solid #3a3227; padding-top: 12px; }
          .address-box { background: #1c1916; border: 1px solid #2a2520; padding: 15px; border-radius: 4px; font-size: 13px; line-height: 1.6; color: #d4c5b2; }
          .footer { text-align: center; font-size: 11px; color: #736758; margin-top: 30px; border-top: 1px solid #2a2520; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">İLLURÊ</div>
            <div class="sub">HAUTE PARFUMERIE</div>
          </div>

          <div style="text-align: center;">
            <div class="title">Thank You For Your Order</div>
            <p style="color: #a39788; font-size: 13px;">Dear ${data.customerName}, your order has been received and is being prepared with elegance.</p>
            <div class="order-badge">ORDER #${data.orderNumber}</div>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Order Summary</div>
            <table>
              <tr class="totals-row">
                <td style="color: #a39788;">Subtotal</td>
                <td style="text-align: right; color: #e6dfd5;">₹${data.subtotal.toFixed(2)}</td>
              </tr>
              ${
                data.giftPackagingAmount > 0
                  ? `<tr class="totals-row"><td style="color: #a39788;">Gift Packaging</td><td style="text-align: right; color: #e6dfd5;">₹${data.giftPackagingAmount.toFixed(2)}</td></tr>`
                  : ''
              }
              ${
                data.discountAmount > 0
                  ? `<tr class="totals-row"><td style="color: #4ade80;">Discount</td><td style="text-align: right; color: #4ade80;">-₹${data.discountAmount.toFixed(2)}</td></tr>`
                  : ''
              }
              <tr class="totals-row">
                <td style="color: #a39788;">Shipping</td>
                <td style="text-align: right; color: #e6dfd5;">${data.shippingAmount === 0 ? 'FREE' : `₹${data.shippingAmount.toFixed(2)}`}</td>
              </tr>
              <tr class="grand-total">
                <td>Grand Total</td>
                <td style="text-align: right;">₹${data.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Shipping & Payment</div>
            <div class="address-box">
              <strong>${data.shippingAddress.fullName}</strong><br>
              ${data.shippingAddress.addressLine1}${data.shippingAddress.addressLine2 ? `, ${data.shippingAddress.addressLine2}` : ''}<br>
              ${data.shippingAddress.landmark ? `Landmark: ${data.shippingAddress.landmark}<br>` : ''}
              ${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.postalCode}<br>
              Phone: ${data.shippingAddress.phone}<br><br>
              <strong>Payment Method:</strong> ${data.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Razorpay)'}<br>
              <strong>Payment Status:</strong> ${data.paymentStatus}
            </div>
          </div>

          <div class="footer">
            &copy; 2026 İLLURÊ FRAGRANCE. All rights reserved.<br>
            For assistance, contact our concierge.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (env.NODE_ENV === 'test') {
        // Skip actual transport dispatch in test environment
        return true;
      }
      const transport = getTransporter();
      await transport.sendMail({
        from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
        to: data.customerEmail,
        subject: `Order Confirmation #${data.orderNumber} - İLLURÊ FRAGRANCE`,
        html: htmlContent,
      });

      if (env.ORDER_NOTIFICATION_EMAIL) {
        await transport.sendMail({
          from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
          to: env.ORDER_NOTIFICATION_EMAIL,
          subject: `[NEW ORDER] #${data.orderNumber} - ₹${data.totalAmount.toFixed(2)}`,
          html: `<p>New order #${data.orderNumber} placed by ${data.customerName} (${data.customerPhone}). Total: ₹${data.totalAmount.toFixed(2)}. Payment Method: ${data.paymentMethod}</p>`,
        });
      }

      return true;
    } catch (err) {
      console.error('⚠️ [EmailService] Failed to send order confirmation email:', err);
      return false;
    }
  }
}
