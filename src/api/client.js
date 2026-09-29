const API_BASE_URL = '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('customer_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cartSessionKey = localStorage.getItem('cart_session_key');
  if (cartSessionKey) {
    headers['X-Cart-Session'] = cartSessionKey;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: options.credentials || 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (data?.data?.sessionKey) {
    localStorage.setItem('cart_session_key', data.data.sessionKey);
  }

  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.message || 'API Request Failed');
    error.status = response.status;
    error.code = data?.error?.code;
    error.data = data;
    throw error;
  }

  return data;
}
