import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext({
  recentProductIds: [],
  recordView: () => {},
  clearRecentlyViewed: () => {},
});

const STORAGE_KEY = 'illure_recently_viewed_v2';
const MAX_ITEMS = 6;

export function RecentlyViewedProvider({ children }) {
  const [recentProductIds, setRecentProductIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const recordView = (productId) => {
    if (!productId) return;
    setRecentProductIds((prev) => {
      // Deduplicate and move to front
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentProductIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentProductIds,
        recordView,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}
