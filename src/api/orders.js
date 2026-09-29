import { apiFetch } from './client';

export const ordersApi = {
  getSummary: (payload) => apiFetch('/checkout/summary', { method: 'POST', body: JSON.stringify(payload) }),
  createOrder: (payload) => apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getCustomerOrders: () => apiFetch('/customer/orders'),
  getCustomerOrderDetails: (orderNumber) => apiFetch(`/customer/orders/${orderNumber}`),
  guestLookup: (orderNumber, emailOrPhone) => apiFetch('/orders/lookup', { method: 'POST', body: JSON.stringify({ orderNumber, emailOrPhone }) }),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('pageSize', params.pageSize);
    if (params.status) query.append('status', params.status);
    if (params.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    return apiFetch(`/admin/orders${queryString ? `?${queryString}` : ''}`);
  },
  getAdminOrderDetails: (id) => apiFetch(`/admin/orders/${id}`),
  updateOrderStatus: (id, status, note) => apiFetch(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
};
