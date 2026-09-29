import { apiFetch } from './client';

export const customerAddressesApi = {
  list: () => apiFetch('/customer/addresses'),
  create: (payload) => apiFetch('/customer/addresses', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/customer/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => apiFetch(`/customer/addresses/${id}`, { method: 'DELETE' }),
  setDefault: (id) => apiFetch(`/customer/addresses/${id}/default`, { method: 'POST' }),
};
