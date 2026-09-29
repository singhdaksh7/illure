import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import IllureCrest from './IllureCrest';

export default function Header({ 
  onOpenSearch, 
  onOpenCart, 
  cartCount = 0,
  activeTab = 'home',
  setActiveTab,
  onSelectCategory,
  onSelectGender
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tabName, gender = null, category = null) => {
    setActiveTab(tabName);
    if (gender && onSelectGender) onSelectGender(gender);
    if (category && onSelectCategory) onSelectCategory(category);
    setMobileMenuOpen(false);
    if (tabName === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-[#080C0D]/90 backdrop-blur-md py-3.5 border-b border-white/[0.08] shadow-2xl' 
            : 'bg-gradient-to-b from-[#080C0D] via-[#080C0D]/60 to-transparent py-5 md:py-7'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* LEFT NAV: SHOP, MEN, WOMEN, NICHE */}
          <nav className="hidden lg:flex items-center space-x-9 text-[11px] tracking-[0.25em] font-interface-sans font-medium text-[#8F9897]">
            <button 
              onClick={() => handleNavClick('shop')}
              className={`hover:text-[#F2EFE8] transition-colors relative py-1 uppercase tracking-[0.3em] ${
                activeTab === 'shop' ? 'text-[#F2EFE8]' : ''
              }`}
            >
              SHOP
              {activeTab === 'shop' && (
                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#B89A62]" />
              )}
            </button>
            
            <button 
              onClick={() => handleNavClick('shop', 'Him')}
              className="hover:text-[#F2EFE8] transition-colors py-1 uppercase tracking-[0.3em]"
            >
              MEN
            </button>

            <button 
              onClick={() => handleNavClick('shop', 'Her')}
              className="hover:text-[#F2EFE8] transition-colors py-1 uppercase tracking-[0.3em]"
            >
              WOMEN
            </button>

            <button 
              onClick={() => handleNavClick('shop', null, 'niche')}
              className={`hover:text-[#F2EFE8] transition-colors relative py-1 uppercase tracking-[0.3em] ${
                activeTab === 'niche' ? 'text-[#F2EFE8]' : ''
              }`}
            >
              NICHE
            </button>
          </nav>

          {/* MOBILE HAMBURGER BUTTON (LEFT ON MOBILE) */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#F2EFE8] hover:text-[#B89A62] transition-colors"
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* CENTER: BRAND WORDMARK "İLLURÊ FRAGRANCE" */}
          <div className="text-center">
            <button 
              onClick={() => handleNavClick('home')}
              className="group focus:outline-none flex flex-col items-center"
            >
              <span className="font-bodoni text-2xl md:text-3xl font-light tracking-[0.35em] text-[#F2EFE8] group-hover:text-[#B89A62] transition-colors duration-300 uppercase">
                İLLURÊ
              </span>
              <span className="font-interface-sans text-[8px] md:text-[9px] tracking-[0.45em] text-[#B89A62] uppercase font-medium mt-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                FRAGRANCE
              </span>
            </button>
          </div>

          {/* RIGHT NAV: Search Icon, Bag (0), Menu Icon */}
          <div className="flex items-center space-x-6 text-[#F2EFE8]">
            {/* Search Icon */}
            <button 
              onClick={onOpenSearch}
              className="p-1.5 hover:text-[#B89A62] transition-colors text-[#8F9897] hover:text-[#F2EFE8]"
              aria-label="Search"
              title="Search Fragrances"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5 stroke-[1.5]" />
            </button>

            {/* Bag (0) button */}
            <button 
              onClick={onOpenCart}
              className="flex items-center space-x-2 text-[11px] tracking-[0.25em] font-interface-sans font-medium text-[#8F9897] hover:text-[#F2EFE8] transition-colors py-1 uppercase"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.5] text-[#F2EFE8]" />
              <span className="hidden sm:inline">BAG ({cartCount})</span>
              <span className="sm:hidden font-mono text-xs text-[#B89A62]">({cartCount})</span>
            </button>

            {/* Menu icon */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="hidden lg:block p-1.5 hover:text-[#B89A62] transition-colors text-[#8F9897] hover:text-[#F2EFE8]"
              aria-label="Menu"
              title="Navigation Menu"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE / OVERLAY MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#080C0D]/90 backdrop-blur-xl transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide Drawer */}
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#101617] border-l border-white/[0.08] p-8 md:p-12 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/[0.08]">
                <div className="flex items-center space-x-3">
                  <IllureCrest className="w-9 h-9" color="#B89A62" variant="simplified" />
                  <div className="flex flex-col">
                    <span className="font-bodoni text-xl tracking-[0.3em] text-[#F2EFE8]">
                      İLLURÊ
                    </span>
                    <span className="font-interface-sans text-[8px] tracking-[0.4em] text-[#B89A62] uppercase">
                      FRAGRANCE
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#8F9897] hover:text-[#F2EFE8] transition-colors"
                >
                  <X className="w-5 h-5 stroke-[1.5]" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-6 font-editorial-serif text-2xl tracking-widest text-[#8F9897]">
                <button 
                  onClick={() => handleNavClick('home')}
                  className={`w-full text-left py-2 border-b border-white/[0.04] flex items-center justify-between hover:text-[#F2EFE8] transition-colors ${
                    activeTab === 'home' ? 'text-[#F2EFE8]' : ''
                  }`}
                >
                  <span>HOMEPAGE</span>
                  <ChevronRight className="w-4 h-4 text-[#8F9897]" />
                </button>

                <button 
                  onClick={() => handleNavClick('shop')}
                  className="w-full text-left py-2 border-b border-white/[0.04] flex items-center justify-between hover:text-[#F2EFE8] transition-colors"
                >
                  <span>ALL FRAGRANCES</span>
                  <ChevronRight className="w-4 h-4 text-[#8F9897]" />
                </button>

                <button 
                  onClick={() => handleNavClick('shop', 'Him')}
                  className="w-full text-left py-2 border-b border-white/[0.04] flex items-center justify-between hover:text-[#F2EFE8] transition-colors"
                >
                  <span>FOR HIM</span>
                  <ChevronRight className="w-4 h-4 text-[#8F9897]" />
                </button>

                <button 
                  onClick={() => handleNavClick('shop', 'Her')}
                  className="w-full text-left py-2 border-b border-white/[0.04] flex items-center justify-between hover:text-[#F2EFE8] transition-colors"
                >
                  <span>FOR HER</span>
                  <ChevronRight className="w-4 h-4 text-[#8F9897]" />
                </button>

                <button 
                  onClick={() => handleNavClick('shop', null, 'niche')}
                  className="w-full text-left py-2 border-b border-white/[0.04] flex items-center justify-between hover:text-[#F2EFE8] transition-colors"
                >
                  <span>NICHE COLLECTION</span>
                  <ChevronRight className="w-4 h-4 text-[#8F9897]" />
                </button>
              </div>
            </div>

            <div className="pt-8 border-t border-white/[0.08] space-y-4">
              <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] text-[#B89A62] uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LEAVE AN IMPRESSION.</span>
              </div>
              <p className="text-[10px] tracking-[0.2em] text-[#8F9897] uppercase">
                İLLURÊ FRAGRANCE · HAUTE PARFUMERIE
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
