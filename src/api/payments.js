import { apiFetch } from './client';

export const paymentsApi = {
  createRazorpayOrder: (orderId) => apiFetch('/payments/razorpay/create-order', { method: 'POST', body: JSON.stringify({ orderId }) }),
  verifyRazorpayPayment: (data) => apiFetch('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(data) }),
};

