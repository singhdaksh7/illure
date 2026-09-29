import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerAuthApi } from '../api/auth';
import { cartApi } from '../api/cart';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    try {
      const token = localStorage.getItem('customer_access_token');
      if (token) {
        const res = await customerAuthApi.me();
        setCustomer(res.data.customer);
      } else {
        const refreshRes = await customerAuthApi.refresh();
        if (refreshRes?.data?.accessToken) {
          localStorage.setItem('customer_access_token', refreshRes.data.accessToken);
          setCustomer(refreshRes.data.customer);
        }
      }
    } catch {
      localStorage.removeItem('customer_access_token');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (emailOrPhone, password) => {
    const res = await customerAuthApi.login({ emailOrPhone, password });
    const { accessToken, customer: user } = res.data;
    localStorage.setItem('customer_access_token', accessToken);
    setCustomer(user);

    const guestSessionKey = localStorage.getItem('cart_session_key');
    if (guestSessionKey) {
      try {
        await cartApi.mergeCart(guestSessionKey);
      } catch (err) {
        console.error('Cart merge notice:', err);
      }
    }

    return user;
  };

  const register = async (name, email, phone, password) => {
    const res = await customerAuthApi.register({ name, email, phone, password });
    const { accessToken, customer: user } = res.data;
    localStorage.setItem('customer_access_token', accessToken);
    setCustomer(user);

    const guestSessionKey = localStorage.getItem('cart_session_key');
    if (guestSessionKey) {
      try {
        await cartApi.mergeCart(guestSessionKey);
      } catch (err) {
        console.error('Cart merge notice:', err);
      }
    }

    return user;
  };

  const logout = async () => {
    try {
      await customerAuthApi.logout();
    } catch (err) {
      console.error('Logout notice:', err);
    } finally {
      localStorage.removeItem('customer_access_token');
      setCustomer(null);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        login,
        register,
        logout,
        restoreSession,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
