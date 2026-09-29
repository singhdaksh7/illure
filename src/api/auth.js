import { apiFetch } from './client';

export const customerAuthApi = {
  register: (payload) => apiFetch('/auth/customer/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiFetch('/auth/customer/login', { method: 'POST', body: JSON.stringify(payload) }),
  refresh: () => apiFetch('/auth/customer/refresh', { method: 'POST' }),
  logout: () => apiFetch('/auth/customer/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/customer/me'),
};
