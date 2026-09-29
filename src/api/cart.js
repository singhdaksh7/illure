import { apiFetch } from './client';

export const cartApi = {
  getCart: () => apiFetch('/cart'),
  addItem: (payload) => apiFetch('/cart/items', { method: 'POST', body: JSON.stringify(payload) }),
  updateItem: (itemId, payload) => apiFetch(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  removeItem: (itemId) => apiFetch(`/cart/items/${itemId}`, { method: 'DELETE' }),
  clearCart: () => apiFetch('/cart', { method: 'DELETE' }),
  mergeCart: (sessionKey) => apiFetch('/cart/merge', { method: 'POST', body: JSON.stringify({ sessionKey }) }),
};
