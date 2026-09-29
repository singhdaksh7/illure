import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('illure_admin_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on boot
  useEffect(() => {
    async function restoreSession() {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/admin/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAdmin(data.data.admin);
        } else {
          // Token invalid or expired, clear
          localStorage.removeItem('illure_admin_token');
          setAccessToken(null);
          setAdmin(null);
        }
      } catch (err) {
        console.error('Session restore error:', err);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, [accessToken]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Login failed.');
      }

      const token = data.data.accessToken;
      const user = data.data.admin;

      localStorage.setItem('illure_admin_token', token);
      setAccessToken(token);
      setAdmin(user);
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/admin/auth/logout`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('illure_admin_token');
      setAccessToken(null);
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        accessToken,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
