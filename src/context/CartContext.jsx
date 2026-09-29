import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart';
import { couponsApi } from '../api/coupons';
import { useCustomerAuth } from './CustomerAuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { customer } = useCustomerAuth();
  const [cart, setCart] = useState({ id: null, items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res?.data?.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [customer, fetchCart]);

  useEffect(() => {
    if (appliedCoupon && cart.subtotal > 0) {
      couponsApi
        .validate(appliedCoupon.code, cart.subtotal)
        .then((res) => {
          if (res?.data?.valid) {
            setAppliedCoupon({
              code: res.data.coupon.code,
              discountAmount: res.data.discountAmount,
              details: res.data.coupon,
            });
          } else {
            setAppliedCoupon(null);
            setCouponError(res?.data?.reason || 'Coupon is no longer valid for this cart total.');
          }
        })
        .catch(() => {
          setAppliedCoupon(null);
        });
    } else if (cart.subtotal === 0) {
      setAppliedCoupon(null);
    }
  }, [cart.subtotal]);

  const addToCart = async ({ variantId, quantity = 1, giftPackagingId = null, giftMessage = null }) => {
    try {
      const res = await cartApi.addItem({ variantId, quantity, giftPackagingId, giftMessage });
      if (res?.data?.cart) {
        setCart(res.data.cart);
        setIsCartOpen(true);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const updateCartItem = async (itemId, { quantity, giftPackagingId, giftMessage }) => {
    try {
      const res = await cartApi.updateItem(itemId, { quantity, giftPackagingId, giftMessage });
      if (res?.data?.cart) {
        setCart(res.data.cart);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId);
      if (res?.data?.cart) {
        setCart(res.data.cart);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartApi.clearCart();
      if (res?.data?.cart) {
        setCart(res.data.cart);
      }
      setAppliedCoupon(null);
      setCouponError(null);
      return res;
    } catch (err) {
      throw err;
    }
  };

  const applyCoupon = async (code) => {
    setCouponError(null);
    try {
      const res = await couponsApi.validate(code, cart.subtotal);
      if (res?.data?.valid) {
        setAppliedCoupon({
          code: res.data.coupon.code,
          discountAmount: res.data.discountAmount,
          details: res.data.coupon,
        });
        return { success: true, discountAmount: res.data.discountAmount };
      } else {
        const errorMsg = res?.data?.reason || 'Invalid coupon code.';
        setCouponError(errorMsg);
        return { success: false, reason: errorMsg };
      }
    } catch (err) {
      const errorMsg = err?.message || 'Failed to validate coupon.';
      setCouponError(errorMsg);
      return { success: false, reason: errorMsg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
