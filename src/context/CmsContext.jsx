import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsApi } from '../api/cms';

const FALLBACK_APPEARANCE = {
  preset: 'ILLURÊ OBSIDIAN',
  primaryBg: '#0B0B0C',
  secondaryBg: '#121214',
  surfaceBg: '#18181B',
  accentGold: '#B89A62',
  accentGoldMuted: '#A98B55',
  textPrimary: '#F7F4EE',
  textMuted: '#A1A1AA',
  borderRadius: 'minimal',
  fontScale: 'editorial',
};

const FALLBACK_ANNOUNCEMENT = {
  isEnabled: true,
  text: 'Complimentary shipping on orders above ₹999 — Handcrafted Extrait Formulations',
  linkUrl: '#catalog',
  theme: 'gold_subtle',
};

const FALLBACK_NAVIGATION = {
  items: [
    { id: 'shop', label: 'Shop', href: '#catalog', hasMegaMenu: true },
    { id: 'discover', label: 'Discover', href: '#collections', hasMegaMenu: true },
    { id: 'story', label: 'Our Story', href: '#brand-story', hasMegaMenu: false },
    { id: 'mood', label: 'Shop by Mood', href: '#mood', hasMegaMenu: false },
  ],
  megaMenu: {
    shop: [
      { label: 'All Fragrances', filter: 'all' },
      { label: 'Men', filter: 'MEN' },
      { label: 'Women', filter: 'WOMEN' },
      { label: 'Unisex', filter: 'UNISEX' },
      { label: 'Bestsellers', filter: 'bestsellers' },
      { label: 'New Arrivals', filter: 'new' },
    ],
    discover: [
      { label: 'Inspired Collections', href: '#collections' },
      { label: 'Fragrance Families', href: '#catalog' },
      { label: 'Shop by Mood', href: '#mood' },
    ],
    editorial: [
      { label: 'Our Story', href: '#brand-story' },
      { label: 'Craft & Authenticity', href: '#authenticity' },
      { label: 'Gifting Experience', href: '#catalog' },
    ],
    featuredPromotion: {
      title: 'ROYAL OUD REIMAGINED',
      subtitle: 'The Signature Extrait',
      imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600',
      ctaText: 'Discover Scent',
      ctaUrl: '#catalog',
    },
  },
};

const FALLBACK_FOOTER = {
  tagline: 'Haute perfumery reimagined through quiet luxury, exceptional longevity, and architectural design.',
  copyright: '© 2026 İLLURÊ FRAGRANCE. All rights reserved.',
  columns: [
    {
      title: 'SHOP',
      links: [
        { label: 'All Fragrances', href: '#catalog' },
        { label: 'Bestsellers', href: '#bestsellers' },
        { label: 'New Arrivals', href: '#new-arrivals' },
        { label: 'Gift Packaging', href: '#catalog' },
      ],
    },
    {
      title: 'DISCOVER',
      links: [
        { label: 'The House of İLLURÊ', href: '#brand-story' },
        { label: 'Fragrance Notes', href: '#collections' },
        { label: 'Shop By Mood', href: '#mood' },
        { label: 'Authenticity Guarantee', href: '#authenticity' },
      ],
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Order Tracking', href: '#orders' },
        { label: 'Shipping & Delivery', href: '#shipping' },
        { label: 'FAQ & Sizing', href: '#faq' },
        { label: 'Concierge Support', href: 'mailto:concierge@illurefragrance.com' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Authenticity Pledge', href: '#authenticity' },
      ],
    },
  ],
};

const FALLBACK_BRAND_CONTACTS = {
  email: 'concierge@illurefragrance.com',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  instagram: 'https://instagram.com/illurefragrance',
  facebook: 'https://facebook.com/illurefragrance',
};

const CmsContext = createContext(null);

export function CmsProvider({ children }) {
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({
    appearance: FALLBACK_APPEARANCE,
    announcement: FALLBACK_ANNOUNCEMENT,
    navigation: FALLBACK_NAVIGATION,
    footer: FALLBACK_FOOTER,
    brand_contacts: FALLBACK_BRAND_CONTACTS,
    shipping: { flatRate: 99, freeShippingThreshold: 999, isEnabled: true },
  });
  const [loading, setLoading] = useState(true);

  const fetchCmsData = async () => {
    try {
      const res = await cmsApi.getPublicCms();
      if (res?.success && res.data) {
        setSections(res.data.sections || []);
        if (res.data.settings) {
          setSettings((prev) => ({
            ...prev,
            appearance: res.data.settings.appearance || prev.appearance,
            announcement: res.data.settings.announcement || prev.announcement,
            navigation: res.data.settings.navigation || prev.navigation,
            footer: res.data.settings.footer || prev.footer,
            brand_contacts: res.data.settings.brand_contacts || prev.brand_contacts,
            shipping: res.data.settings.shipping || prev.shipping,
          }));
        }
      }
    } catch (err) {
      console.warn('Could not load dynamic CMS data, falling back to local defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  // Synchronize CSS custom property tokens when appearance setting changes
  useEffect(() => {
    const appearance = settings.appearance || FALLBACK_APPEARANCE;
    const root = document.documentElement;

    if (appearance.primaryBg) {
      root.style.setProperty('--color-bg-primary', appearance.primaryBg);
      root.style.setProperty('--bg-main', appearance.primaryBg);
    }
    if (appearance.secondaryBg) {
      root.style.setProperty('--color-bg-secondary', appearance.secondaryBg);
      root.style.setProperty('--bg-secondary', appearance.secondaryBg);
    }
    if (appearance.surfaceBg) {
      root.style.setProperty('--color-surface', appearance.surfaceBg);
      root.style.setProperty('--bg-elevated', appearance.surfaceBg);
    }
    if (appearance.accentGold) {
      root.style.setProperty('--color-gold', appearance.accentGold);
      root.style.setProperty('--champagne', appearance.accentGold);
    }
    if (appearance.accentGoldMuted) {
      root.style.setProperty('--color-gold-muted', appearance.accentGoldMuted);
      root.style.setProperty('--champagne-muted', appearance.accentGoldMuted);
    }
    if (appearance.textPrimary) {
      root.style.setProperty('--color-text-primary', appearance.textPrimary);
      root.style.setProperty('--text-primary', appearance.textPrimary);
    }
    if (appearance.textMuted) {
      root.style.setProperty('--color-text-muted', appearance.textMuted);
      root.style.setProperty('--text-secondary', appearance.textMuted);
    }
  }, [settings.appearance]);

  // Utility to find section config by key
  const getSection = (key) => {
    return sections.find((s) => s.sectionKey === key) || null;
  };

  return (
    <CmsContext.Provider
      value={{
        sections,
        settings,
        appearance: settings.appearance || FALLBACK_APPEARANCE,
        announcement: settings.announcement || FALLBACK_ANNOUNCEMENT,
        navigation: settings.navigation || FALLBACK_NAVIGATION,
        footer: settings.footer || FALLBACK_FOOTER,
        brandContacts: settings.brand_contacts || FALLBACK_BRAND_CONTACTS,
        shipping: settings.shipping || { flatRate: 99, freeShippingThreshold: 999, isEnabled: true },
        loading,
        getSection,
        refreshCms: fetchCmsData,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
}
