import { apiFetch } from './client';

export const productsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiFetch(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getBySlug: (slug) => apiFetch(`/products/${slug}`),
  getCategories: () => apiFetch('/categories'),
  getReferenceBrands: () => apiFetch('/reference-brands'),
};
