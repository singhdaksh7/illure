import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, User, ChevronDown, ChevronRight, Sparkles, ArrowRight, Compass, BookOpen } from 'lucide-react';
import IllureCrest from './IllureCrest';
import { useCms } from '../context/CmsContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useFeatures } from '../context/FeaturesContext';

export default function Header({
  onOpenSearch,
  onOpenCart,
  onOpenScentFinder,
  onOpenNotesExplorer,
  cartCount = 0,
  activeTab = 'home',
  setActiveTab,
  onSelectCategory,
  onSelectGender,
}) {
  const { navigation, shipping } = useCms();
  const { customer, isAuthenticated } = useCustomerAuth();
  const { isFeatureEnabled } = useFeatures();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'shop' | 'discover' | 'editorial' | null
  const [mobileAccordion, setMobileAccordion] = useState({ shop: false, discover: false, editorial: false });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const megaData = navigation?.megaMenu || {};
  const promo = megaData.featuredPromotion || {
    title: 'ROYAL OUD REIMAGINED',
    subtitle: 'Signature Fragrance',
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600',
    ctaText: 'Discover Scent',
    ctaUrl: '#catalog',
  };

  const handleNavClick = (tabName, gender = null, category = null) => {
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
    if (gender && onSelectGender) onSelectGender(gender);
    if (category && onSelectCategory) onSelectCategory(category);
    if (setActiveTab) setActiveTab(tabName);
    if (tabName === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleMobileAccordion = (key) => {
    setMobileAccordion((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'glass-nav-scrolled py-3 shadow-[0_15px_30px_rgba(0,0,0,0.85)]'
            : 'glass-nav-transparent py-5 md:py-6'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* LEFT: COMPACT DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center space-x-8 text-[11px] tracking-[0.25em] font-interface-sans font-medium text-[#D8D0C3]">
            {/* SHOP WITH MEGA MENU TRIGGER */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setActiveMegaMenu('shop')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button
                onClick={() => handleNavClick('shop')}
                className={`flex items-center space-x-1.5 uppercase tracking-[0.28em] transition-colors py-1 relative ${
                  activeTab === 'shop' || activeMegaMenu === 'shop' ? 'text-[#F7F3EA]' : 'hover:text-[#F7F3EA]'
                }`}
              >
                <span>SHOP</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === 'shop' ? 'rotate-180 text-[#D8BE82]' : 'opacity-60'}`} />
                {activeTab === 'shop' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D8BE82]" />
                )}
              </button>
            </div>

            {/* DISCOVER WITH MEGA MENU TRIGGER */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setActiveMegaMenu('discover')}
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              <button
                onClick={() => {
                  const el = document.getElementById('collections-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else handleNavClick('home');
                }}
                className={`flex items-center space-x-1.5 uppercase tracking-[0.28em] transition-colors py-1 relative ${
                  activeMegaMenu === 'discover' ? 'text-[#F7F3EA]' : 'hover:text-[#F7F3EA]'
                }`}
              >
                <span>DISCOVER</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeMegaMenu === 'discover' ? 'rotate-180 text-[#D8BE82]' : 'opacity-60'}`} />
              </button>
            </div>

            {/* EDITORIAL STORY LINK */}
            <button
              onClick={() => {
                const el = document.getElementById('brand-story-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handleNavClick('home');
              }}
              className="hover:text-[#F7F3EA] transition-colors py-1 uppercase tracking-[0.28em]"
            >
              OUR STORY
            </button>

            {/* SHOP BY MOOD LINK */}
            <button
              onClick={() => {
                const el = document.getElementById('shop-by-mood-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handleNavClick('home');
              }}
              className="hover:text-[#F7F3EA] transition-colors py-1 uppercase tracking-[0.28em]"
            >
              MOOD
            </button>

            {/* SCENT FINDER QUIZ TRIGGER */}
            {isFeatureEnabled('scent_finder') && (
              <button
                onClick={onOpenScentFinder}
                className="hover:text-[#D8BE82] text-[#C7A866] transition-colors py-1 uppercase tracking-[0.28em] flex items-center space-x-1"
              >
                <Compass className="w-3 h-3 text-[#C7A866]" />
                <span>FINDER</span>
              </button>
            )}
          </nav>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#F7F4EE] hover:text-[#B89A62] transition-colors focus:outline-none"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* CENTER: BRAND CREST + EDITORIAL LOGO */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() => handleNavClick('home')}
              className="group flex flex-col items-center focus:outline-none cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <IllureCrest size={22} className="text-[#B89A62] opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="font-bodoni text-2xl md:text-3xl font-light tracking-[0.35em] text-[#F7F4EE] group-hover:text-[#B89A62] transition-colors duration-300 uppercase">
                  İLLURÊ
                </span>
              </div>
              <span className="font-interface-sans text-[8px] md:text-[9px] tracking-[0.5em] text-[#B89A62] uppercase font-medium mt-0.5 opacity-85 group-hover:opacity-100 transition-opacity">
                FRAGRANCE
              </span>
            </button>
          </div>

          {/* RIGHT: SEARCH, ACCOUNT, BAG */}
          <div className="flex items-center space-x-5 md:space-x-7 text-[#F7F3EA]">
            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 text-[#D8D0C3] hover:text-[#D8BE82] transition-colors focus:outline-none"
              aria-label="Search Fragrances"
              title="Search Catalog"
            >
              <Search className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.5]" />
            </button>

            {/* Customer Account Portal */}
            <button
              onClick={() => handleNavClick(isAuthenticated ? 'account' : 'login')}
              className="p-1.5 text-[#D8D0C3] hover:text-[#D8BE82] transition-colors focus:outline-none hidden sm:block"
              aria-label="Customer Account"
              title={isAuthenticated ? `Account: ${customer?.name || 'Patron'}` : 'Sign In'}
            >
              <User className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.5]" />
            </button>

            {/* Bag Button with Refined Gold Count Badge */}
            <button
              onClick={onOpenCart}
              className="group flex items-center space-x-2 py-1 text-[11px] tracking-[0.25em] font-interface-sans font-medium text-[#D8D0C3] hover:text-[#F7F3EA] transition-colors focus:outline-none"
              aria-label="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[1.5] text-[#F7F3EA] group-hover:text-[#D8BE82] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D8BE82] text-[#080A0B] font-semibold text-[9px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-1 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline uppercase text-[10px] tracking-[0.28em]">
                BAG
              </span>
            </button>
          </div>
        </div>

        {/* ==================================================
            DESKTOP MEGA MENU DROPDOWN
            ================================================== */}
        {activeMegaMenu && (
          <div 
            className="hidden lg:block absolute top-full left-0 right-0 bg-[#0B0B0C]/98 backdrop-blur-2xl border-b border-[#B89A62]/20 shadow-[0_30px_60px_rgba(0,0,0,0.9)] animate-fade-up"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="max-w-[1440px] mx-auto px-12 py-10 grid grid-cols-12 gap-8">
              
              {/* SECTION: SHOP */}
              <div className="col-span-3 space-y-4 border-r border-white/[0.06] pr-6">
                <h4 className="typography-eyebrow text-[#B89A62] flex items-center space-x-2">
                  <span>SHOP BY COLLECTION</span>
                </h4>
                <ul className="space-y-2.5 text-xs font-light tracking-wider">
                  {(megaData.shop || [
                    { label: 'All Fragrances', filter: 'all' },
                    { label: 'For Him', filter: 'MEN' },
                    { label: 'For Her', filter: 'WOMEN' },
                    { label: 'Unisex', filter: 'UNISEX' },
                    { label: 'The Bestsellers', filter: 'bestsellers' },
                    { label: 'New Arrivals', filter: 'new' },
                  ]).map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          if (item.filter === 'MEN') handleNavClick('shop', 'Him');
                          else if (item.filter === 'WOMEN') handleNavClick('shop', 'Her');
                          else if (item.filter === 'UNISEX') handleNavClick('shop', 'Unisex');
                          else handleNavClick('shop');
                        }}
                        className="text-[#A1A1AA] hover:text-[#F7F4EE] hover:translate-x-1 transition-all flex items-center space-x-1.5 py-0.5"
                      >
                        <span className="text-[#B89A62] opacity-0 hover:opacity-100 transition-opacity">â€’</span>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SECTION: DISCOVER */}
              <div className="col-span-3 space-y-4 border-r border-white/[0.06] pr-6">
                <h4 className="typography-eyebrow text-[#B89A62]">
                  DISCOVER & NOTES
                </h4>
                <ul className="space-y-2.5 text-xs font-light tracking-wider">
                  {isFeatureEnabled('scent_finder') && (
                    <li>
                      <button
                        onClick={() => {
                          setActiveMegaMenu(null);
                          if (onOpenScentFinder) onOpenScentFinder();
                        }}
                        className="text-[#D8BE82] hover:text-[#F7F4EE] hover:translate-x-1 transition-all flex items-center space-x-1.5 py-0.5"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#C7A866]" />
                        <span>Scent Finder Quiz</span>
                      </button>
                    </li>
                  )}
                  {isFeatureEnabled('notes_explorer') && (
                    <li>
                      <button
                        onClick={() => {
                          setActiveMegaMenu(null);
                          if (onOpenNotesExplorer) onOpenNotesExplorer();
                        }}
                        className="text-[#D8BE82] hover:text-[#F7F4EE] hover:translate-x-1 transition-all flex items-center space-x-1.5 py-0.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#C7A866]" />
                        <span>Notes Directory & Accords</span>
                      </button>
                    </li>
                  )}
                  {(megaData.discover || [
                    { label: 'The Inspired Collections', href: '#collections' },
                    { label: 'Fragrance Families & Pyramids', href: '#catalog' },
                    { label: 'Shop By Mood & Aura', href: '#mood' },
                  ]).map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          if (item.href === '#mood') {
                            const el = document.getElementById('shop-by-mood-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            setActiveMegaMenu(null);
                          } else if (item.href === '#collections') {
                            const el = document.getElementById('collections-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            setActiveMegaMenu(null);
                          } else {
                            handleNavClick('shop');
                          }
                        }}
                        className="text-[#A1A1AA] hover:text-[#F7F4EE] hover:translate-x-1 transition-all flex items-center space-x-1.5 py-0.5"
                      >
                        <span className="text-[#B89A62] opacity-0 hover:opacity-100 transition-opacity">â€’</span>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SECTION: EDITORIAL */}
              <div className="col-span-3 space-y-4 border-r border-white/[0.06] pr-6">
                <h4 className="typography-eyebrow text-[#B89A62]">
                  ABOUT İLLURÊ
                </h4>
                <ul className="space-y-2.5 text-xs font-light tracking-wider">
                  {(megaData.editorial || [
                    { label: 'The İLLURÊ Story', href: '#brand-story' },
                    { label: 'Why İLLURÊ', href: '#authenticity' },
                    { label: 'Gift Packaging', href: '#catalog' },
                  ]).map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => {
                          if (item.href === '#brand-story') {
                            const el = document.getElementById('brand-story-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            setActiveMegaMenu(null);
                          } else if (item.href === '#authenticity') {
                            const el = document.getElementById('authenticity-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                            setActiveMegaMenu(null);
                          } else {
                            handleNavClick('shop');
                          }
                        }}
                        className="text-[#A1A1AA] hover:text-[#F7F4EE] hover:translate-x-1 transition-all flex items-center space-x-1.5 py-0.5"
                      >
                        <span className="text-[#B89A62] opacity-0 hover:opacity-100 transition-opacity">â€’</span>
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SECTION: FEATURED PROMOTION CARD */}
              <div className="col-span-3 flex flex-col justify-between p-4 bg-[#121214] border border-[#B89A62]/20 rounded-xs group cursor-pointer"
                onClick={() => handleNavClick('shop')}
              >
                <div className="relative h-32 overflow-hidden rounded-xs mb-3">
                  <img
                    src={promo.imageUrl}
                    alt={promo.title}
                    onError={(e) => { e.currentTarget.src = "/images/illure-placeholder.svg"; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-80" />
                </div>
                <div className="space-y-1">
                  <span className="typography-eyebrow text-[9px] text-[#B89A62]">FEATURED HIGHLIGHT</span>
                  <h5 className="font-editorial-serif text-lg text-[#F7F4EE] group-hover:text-[#B89A62] transition-colors">
                    {promo.title}
                  </h5>
                  <p className="text-[11px] text-[#A1A1AA] line-clamp-1">
                    {promo.subtitle}
                  </p>
                </div>
                <div className="pt-3 flex items-center space-x-1.5 text-[10px] tracking-widest text-[#B89A62] uppercase font-medium">
                  <span>{promo.ctaText}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* ==================================================
          MOBILE FULL-SCREEN ACCORDION DRAWER
          ================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0B0B0C]/85 backdrop-blur-md transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-sm bg-[#0B0B0C] border-l border-[#B89A62]/20 h-full flex flex-col justify-between z-10 p-6 sm:p-8 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <IllureCrest size={20} className="text-[#B89A62]" />
                  <span className="font-bodoni text-xl tracking-[0.3em] uppercase text-[#F7F4EE]">
                    İLLURÊ
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#A1A1AA] hover:text-[#F7F4EE] transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Accordion Navigation */}
              <div className="py-6 space-y-4">
                {/* SHOP ACCORDION */}
                <div className="border-b border-white/[0.06] pb-3">
                  <button
                    onClick={() => toggleMobileAccordion('shop')}
                    className="w-full flex items-center justify-between text-left py-2 font-editorial-serif text-2xl text-[#F7F4EE]"
                  >
                    <span>SHOP</span>
                    <ChevronDown className={`w-4 h-4 text-[#B89A62] transition-transform ${mobileAccordion.shop ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordion.shop && (
                    <div className="pl-4 pt-2 space-y-3 font-interface-sans text-xs tracking-wider text-[#A1A1AA]">
                      <button onClick={() => handleNavClick('shop')} className="block hover:text-[#B89A62]">
                        All Fragrances
                      </button>
                      <button onClick={() => handleNavClick('shop', 'MEN')} className="block hover:text-[#B89A62]">
                        Men
                      </button>
                      <button onClick={() => handleNavClick('shop', 'WOMEN')} className="block hover:text-[#B89A62]">
                        Women
                      </button>
                      <button onClick={() => handleNavClick('shop', 'UNISEX')} className="block hover:text-[#B89A62]">
                        Unisex
                      </button>
                    </div>
                  )}
                </div>

                {/* DISCOVER ACCORDION */}
                <div className="border-b border-white/[0.06] pb-3">
                  <button
                    onClick={() => toggleMobileAccordion('discover')}
                    className="w-full flex items-center justify-between text-left py-2 font-editorial-serif text-2xl text-[#F7F4EE]"
                  >
                    <span>DISCOVER</span>
                    <ChevronDown className={`w-4 h-4 text-[#B89A62] transition-transform ${mobileAccordion.discover ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileAccordion.discover && (
                    <div className="pl-4 pt-2 space-y-3 font-interface-sans text-xs tracking-wider text-[#A1A1AA]">
                      {isFeatureEnabled('scent_finder') && (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (onOpenScentFinder) onOpenScentFinder();
                          }}
                          className="block text-[#D8BE82] hover:text-[#F7F4EE]"
                        >
                          Scent Finder Quiz
                        </button>
                      )}
                      {isFeatureEnabled('notes_explorer') && (
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            if (onOpenNotesExplorer) onOpenNotesExplorer();
                          }}
                          className="block text-[#D8BE82] hover:text-[#F7F4EE]"
                        >
                          Notes & Accords Archive
                        </button>
                      )}
                      <button onClick={() => {
                        const el = document.getElementById('collections-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        setMobileMenuOpen(false);
                      }} className="block hover:text-[#B89A62]">
                        Fragrance Editions
                      </button>
                      <button onClick={() => {
                        const el = document.getElementById('shop-by-mood-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        setMobileMenuOpen(false);
                      }} className="block hover:text-[#B89A62]">
                        Shop By Mood
                      </button>
                    </div>
                  )}
                </div>

                {/* DIRECT EDITORIAL LINKS */}
                <div className="space-y-3 pt-2 font-editorial-serif text-2xl text-[#F7F4EE]">
                  <button
                    onClick={() => {
                      const el = document.getElementById('brand-story-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      setMobileMenuOpen(false);
                    }}
                    className="block text-left hover:text-[#B89A62] transition-colors"
                  >
                    OUR STORY
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('authenticity-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      setMobileMenuOpen(false);
                    }}
                    className="block text-left hover:text-[#B89A62] transition-colors"
                  >
                    AUTHENTICITY
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/[0.08] space-y-3">
              <button
                onClick={() => handleNavClick(isAuthenticated ? 'account' : 'login')}
                className="w-full py-3 bg-[#121214] border border-[#B89A62]/30 text-center font-interface-sans text-xs tracking-[0.25em] uppercase text-[#F7F4EE] hover:bg-[#B89A62] hover:text-[#0B0B0C] transition-all"
              >
                {isAuthenticated ? `PORTAL (${customer?.name?.split(' ')[0] || 'PATRON'})` : 'PATRON SIGN IN'}
              </button>
              <p className="text-[10px] tracking-widest text-center text-[#A1A1AA] uppercase">
                {shipping?.freeShippingThreshold
                  ? `Complimentary Shipping Above ₹${shipping.freeShippingThreshold.toLocaleString('en-IN')}`
                  : 'Complimentary Luxury Packaging'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
