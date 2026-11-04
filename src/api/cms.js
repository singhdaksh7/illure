import { apiFetch } from './client';

export const cmsApi = {
  // Public Storefront
  getPublicCms: () => apiFetch('/cms'),

  // Admin CMS Management
  getSections: (token) =>
    apiFetch('/admin/cms/sections', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  updateSection: (id, data, token) =>
    apiFetch(`/admin/cms/sections/${id}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    }),

  reorderSections: (orderedIds, token) =>
    apiFetch('/admin/cms/sections/reorder', {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ orderedIds }),
    }),

  getSettings: (token) =>
    apiFetch('/admin/cms/settings', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  updateSetting: (key, value, token) =>
    apiFetch(`/admin/cms/settings/${key}`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ value }),
    }),

  seedDefaults: (token) =>
    apiFetch('/admin/cms/seed-defaults', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
};
