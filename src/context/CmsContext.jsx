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
  text: 'Free shipping on orders over ₹999 · Scent, without the noise',
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
      { label: 'New Drops', filter: 'new' },
    ],
    discover: [
      { label: 'Fragrance Editions', href: '#collections' },
      { label: 'Scent Families', href: '#catalog' },
      { label: 'Shop by Mood', href: '#mood' },
    ],
    editorial: [
      { label: 'Our Story', href: '#brand-story' },
      { label: 'Why İLLURÊ', href: '#authenticity' },
      { label: 'Gift Packaging', href: '#catalog' },
    ],
    featuredPromotion: {
      title: 'DARK. WARM. ADDICTIVE.',
      subtitle: 'Built for after dark',
      imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600',
      ctaText: 'Explore Scent',
      ctaUrl: '#catalog',
    },
  },
};

const FALLBACK_FOOTER = {
  tagline: 'Scent, without the noise. Familiar notes with our own point of view.',
  copyright: '© 2026 İLLURÊ FRAGRANCE. All rights reserved.',
  disclaimer: 'Reference brand names are used only to describe fragrance inspiration and olfactory reference. İLLURÊ FRAGRANCE is an independent brand and is not affiliated with, endorsed by, or sponsored by the referenced trademark owners.',
  columns: [
    {
      title: 'SHOP',
      links: [
        { label: 'All Fragrances', href: '#catalog' },
        { label: 'Bestsellers', href: '#bestsellers' },
        { label: 'New Drops', href: '#new-arrivals' },
        { label: 'Gift Packaging', href: '#catalog' },
      ],
    },
    {
      title: 'DISCOVER',
      links: [
        { label: 'The İLLURÊ Story', href: '#brand-story' },
        { label: 'Fragrance Notes', href: '#collections' },
        { label: 'Shop By Mood', href: '#mood' },
        { label: 'Why İLLURÊ', href: '#authenticity' },
      ],
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Order Tracking', href: '#orders' },
        { label: 'Shipping & Delivery', href: '#shipping' },
        { label: 'FAQ & Sizing', href: '#faq' },
        { label: 'Contact', href: 'mailto:concierge@illurefragrance.com' },
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Why İLLURÊ', href: '#authenticity' },
      ],
    },
  ],
};

const FALLBACK_BRAND_CONTACTS = {
  email: null,
  phone: null,
  whatsapp: null,
  instagram: null,
  facebook: null,
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
      setLoading(true);
      const res = await cmsApi.getPublicCms();
      if (res?.success && res.data) {
        if (Array.isArray(res.data.sections)) {
          setSections(res.data.sections);
        }
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

    let primaryBg = appearance.primaryBg || appearance.colorBgPrimary || '#0B0B0C';
    let secondaryBg = appearance.secondaryBg || '#121214';
    let surfaceBg = appearance.surfaceBg || '#18181B';
    let accentGold = appearance.accentGold || appearance.colorGold || '#B89A62';
    let accentGoldMuted = appearance.accentGoldMuted || appearance.colorGoldMuted || '#A98B55';
    let textPrimary = appearance.textPrimary || '#F7F4EE';
    let textMuted = appearance.textMuted || '#A1A1AA';

    // Safe contrast handling for Ivory & Dark presets
    if (appearance.preset === 'ILLURÊ IVORY' || appearance.preset === 'ILLURE_IVORY') {
      primaryBg = '#F7F4EE';
      secondaryBg = '#EFECE4';
      surfaceBg = '#E8E4DA';
      textPrimary = '#0D1112';
      textMuted = '#52525B';
    } else if (appearance.preset === 'CAMPAIGN DARK' || appearance.preset === 'CAMPAIGN_DARK') {
      primaryBg = '#050708';
      secondaryBg = '#090D0E';
      surfaceBg = '#0F1416';
      textPrimary = '#F7F4EE';
      textMuted = '#9CA3AF';
    }

    root.style.setProperty('--color-bg-primary', primaryBg);
    root.style.setProperty('--bg-main', primaryBg);
    root.style.setProperty('--color-bg-secondary', secondaryBg);
    root.style.setProperty('--bg-secondary', secondaryBg);
    root.style.setProperty('--color-surface', surfaceBg);
    root.style.setProperty('--bg-elevated', surfaceBg);
    root.style.setProperty('--color-gold', accentGold);
    root.style.setProperty('--champagne', accentGold);
    root.style.setProperty('--color-gold-muted', accentGoldMuted);
    root.style.setProperty('--champagne-muted', accentGoldMuted);
    root.style.setProperty('--color-text-primary', textPrimary);
    root.style.setProperty('--text-primary', textPrimary);
    root.style.setProperty('--color-text-muted', textMuted);
    root.style.setProperty('--text-secondary', textMuted);

    // Border radius mode
    if (appearance.borderRadiusMode === 'sharp') {
      root.style.setProperty('--radius-xs', '0px');
      root.style.setProperty('--radius-sm', '2px');
    } else if (appearance.borderRadiusMode === 'soft') {
      root.style.setProperty('--radius-xs', '4px');
      root.style.setProperty('--radius-sm', '6px');
    } else {
      root.style.setProperty('--radius-xs', '2px');
      root.style.setProperty('--radius-sm', '4px');
    }
  }, [settings.appearance]);

  // Utility to find section config by key
  const getSection = (key) => {
    return sections.find((s) => s.sectionKey === key) || null;
  };

  const isSectionVisible = (key) => {
    const s = getSection(key);
    return s ? Boolean(s.isEnabled) : true;
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
        isSectionVisible,
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
