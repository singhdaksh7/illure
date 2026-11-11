import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCustomerAuth } from './CustomerAuthContext';

const WishlistContext = createContext({
  wishlistIds: [],
  wishlistItems: [],
  isInWishlist: () => false,
  toggleWishlist: async () => {},
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  loading: false,
});

const GUEST_STORAGE_KEY = 'illure_guest_wishlist';

export function WishlistProvider({ children }) {
  const { customer, accessToken } = useCustomerAuth();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync / fetch wishlist when customer authenticates
  useEffect(() => {
    if (customer && accessToken) {
      syncAndFetchCustomerWishlist();
    } else {
      // Guest mode: update storage on ids change
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(wishlistIds));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
    }
  }, [customer, accessToken]);

  const syncAndFetchCustomerWishlist = async () => {
    setLoading(true);
    try {
      // 1. If guest has local items, merge them first
      const guestStored = localStorage.getItem(GUEST_STORAGE_KEY);
      const guestIds = guestStored ? JSON.parse(guestStored) : [];

      if (guestIds.length > 0) {
        await fetch('/api/wishlist/merge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productIds: guestIds }),
        });
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }

      // 2. Fetch authenticated wishlist
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.success && data.data?.items) {
        setWishlistItems(data.data.items);
        setWishlistIds(data.data.items.map((i) => i.productId));
      }
    } catch (err) {
      console.warn('Failed to sync customer wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.includes(productId);
  };

  const addToWishlist = async (product) => {
    const productId = typeof product === 'string' ? product : product.id;
    if (wishlistIds.includes(productId)) return;

    setWishlistIds((prev) => [...prev, productId]);

    if (customer && accessToken) {
      try {
        await fetch(`/api/wishlist/${productId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        // Refresh full items list
        const res = await fetch('/api/wishlist', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (data.success && data.data?.items) {
          setWishlistItems(data.data.items);
        }
      } catch (err) {
        console.warn('Failed to persist wishlist addition:', err);
      }
    } else {
      const updated = [...wishlistIds, productId];
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    setWishlistItems((prev) => prev.filter((item) => item.productId !== productId && item.id !== productId));

    if (customer && accessToken) {
      try {
        await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } catch (err) {
        console.warn('Failed to remove from backend wishlist:', err);
      }
    } else {
      const updated = wishlistIds.filter((id) => id !== productId);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const toggleWishlist = async (product) => {
    const productId = typeof product === 'string' ? product : product.id;
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
