import { apiFetch } from './client';

export const couponsApi = {
  validate: (code, subtotal) =>
    apiFetch('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
};
