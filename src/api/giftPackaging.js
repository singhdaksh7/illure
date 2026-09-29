import { apiFetch } from './client';

export const giftPackagingApi = {
  getPublic: () => apiFetch('/gift-packaging/public'),
};
