import { apiFetch } from './client';

export const settingsApi = {
  getShippingSettings: () => apiFetch('/settings/shipping'),
  updateShippingSettings: (data) => apiFetch('/settings/shipping', { method: 'PATCH', body: JSON.stringify(data) }),
};

