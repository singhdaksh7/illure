import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturedFragrancesSection from './components/FeaturedFragrancesSection';
import CollectionsSection from './components/CollectionsSection';
import CinematicBrandMoment from './components/CinematicBrandMoment';
import ShopByMoodSection from './components/ShopByMoodSection';
import BrandStorySection from './components/BrandStorySection';
import BrandsMarqueeSection from './components/BrandsMarqueeSection';
import NewArrivalSection from './components/NewArrivalSection';
import AuthenticitySection from './components/AuthenticitySection';
import NewsletterSection from './components/NewsletterSection';
import FooterSection from './components/FooterSection';
import ProductDetailPage from './components/ProductDetailPage';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import CustomCursor from './components/CustomCursor';
import IntroOverlay from './components/IntroOverlay';
import AdminPortal from './admin/AdminPortal';
import { PRODUCTS } from './data/products';
import { ArrowRight, Filter, Sparkles } from 'lucide-react';

// Enrich dataset with local high-res imagery for top items
const ENRICHED_PRODUCTS = PRODUCTS.map(p => {
  if (p.id === 'tf-oud-wood') {
    return { ...p, image: '/images/oud_wood.jpg', price: 21500 };
  }
  if (p.id === 'dior-sauvage-elixir') {
    return { ...p, image: '/images/sauvage.jpg', price: 17900 };
  }
  if (p.id === 'creed-aventus') {
    return { ...p, price: 32000 };
  }
  return p;
});

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  });

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'product' | 'shop'
  const [selectedProductId, setSelectedProductId] = useState('tf-oud-wood');
  const [cartItems, setCartItems] = useState([
    {
      id: 'tf-oud-wood',
      name: 'Oud Wood',
      brand: 'TOM FORD',
      price: 21500,
      selectedSize: '100 ML',
      quantity: 1,
      image: '/images/oud_wood.jpg'
    }
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isAdminRoute) {
    return (
      <AdminPortal
        onGoToStore={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, selectedProductId]);

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    setActiveTab('product');
  };

  const handleAddToCart = (productObj) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        i => i.id === productObj.id && i.selectedSize === (productObj.selectedSize || '100 ML')
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      } else {
        return [
          ...prev,
          {
            id: productObj.id,
            name: productObj.name,
            brand: productObj.brand,
            price: productObj.price || 21500,
            selectedSize: productObj.selectedSize || '100 ML',
            quantity: 1,
            image: productObj.image || '/images/oud_wood.jpg'
          }
        ];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id, size);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Filter products for Shop Catalog view
  const filteredProducts = ENRICHED_PRODUCTS.filter(p => {
    if (genderFilter && p.gender !== genderFilter && p.gender !== 'Unisex') return false;
    if (categoryFilter === 'niche' && !p.niche) return false;
    if (categoryFilter && categoryFilter !== 'niche' && p.fragranceFamily.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080C0D] text-[#F2EFE8] relative overflow-x-hidden selection:bg-[#B89A62] selection:text-[#080C0D]">
      
      {/* Intro Brand Overlay */}
      <IntroOverlay />

      {/* Custom Desktop Cursor */}
      <CustomCursor />

      {/* Navigation Header */}
      <Header 
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectCategory={(cat) => { setCategoryFilter(cat); setActiveTab('shop'); }}
        onSelectGender={(g) => { setGenderFilter(g); setActiveTab('shop'); }}
      />

      {/* VIEW RENDERER */}
      {activeTab === 'home' && (
        <main>
          {/* 1. HOMEPAGE HERO (Reference Inspired Dark Cinematic Opening) */}
          <HeroSection 
            onExplore={() => {
              const el = document.getElementById('curated-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onProductSelect={handleSelectProduct}
          />

          {/* 2. SECTION 2 — FEATURED FRAGRANCES (01 / CURATED) */}
          <div id="curated-section">
            <FeaturedFragrancesSection 
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* 3. SECTION 3 — COLLECTIONS (02 / DISCOVER) */}
          <CollectionsSection 
            onSelectCollection={(gFilter, cFilter) => {
              setGenderFilter(gFilter);
              setCategoryFilter(cFilter);
              setActiveTab('shop');
            }}
          />

          {/* 4. SECTION 4 — CINEMATIC BRAND MOMENT */}
          <CinematicBrandMoment />

          {/* 5. SECTION 5 — SHOP BY MOOD (03 / CHARACTER) */}
          <ShopByMoodSection 
            onSelectMood={(moodId) => {
              setCategoryFilter(moodId);
              setActiveTab('shop');
            }}
          />

          {/* 6. SECTION 6 — BRAND STORY */}
          <BrandStorySection 
            onDiscoverStory={() => setActiveTab('shop')}
          />

          {/* 7. SECTION 7 — BRANDS MARQUEE */}
          <BrandsMarqueeSection />

          {/* 8. SECTION 8 — NEW ARRIVAL FEATURE */}
          <NewArrivalSection 
            onSelectProduct={handleSelectProduct}
          />

          {/* 9. SECTION 9 — AUTHENTICITY */}
          <AuthenticitySection />

          {/* 10. SECTION 10 — NEWSLETTER */}
          <NewsletterSection />
        </main>
      )}

      {/* DEMO PRODUCT PAGE VIEW */}
      {activeTab === 'product' && (
        <main>
          <ProductDetailPage 
            productId={selectedProductId}
            productsData={ENRICHED_PRODUCTS}
            onBack={() => setActiveTab('home')}
            onAddToCart={handleAddToCart}
            onSelectProduct={handleSelectProduct}
          />
        </main>
      )}

      {/* CATALOG / SHOP VIEW */}
      {activeTab === 'shop' && (
        <main className="pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
          
          <div className="mb-12 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase">
                HAUTE PARFUMERIE
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <h1 className="font-editorial-serif text-5xl md:text-6xl font-light">
                THE İLLURÊ <span className="italic text-[#B89A62]">CATALOGUE</span>
              </h1>

              {/* FILTER BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 font-interface-sans text-xs tracking-widest uppercase">
                <button 
                  onClick={() => { setGenderFilter(null); setCategoryFilter(null); }}
                  className={`px-4 py-2 border transition-all ${
                    !genderFilter && !categoryFilter ? 'border-[#B89A62] bg-[#101617] text-[#F2EFE8]' : 'border-white/10 text-[#8F9897]'
                  }`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => { setGenderFilter('Him'); setCategoryFilter(null); }}
                  className={`px-4 py-2 border transition-all ${
                    genderFilter === 'Him' ? 'border-[#B89A62] bg-[#101617] text-[#F2EFE8]' : 'border-white/10 text-[#8F9897]'
                  }`}
                >
                  FOR HIM
                </button>
                <button 
                  onClick={() => { setGenderFilter('Her'); setCategoryFilter(null); }}
                  className={`px-4 py-2 border transition-all ${
                    genderFilter === 'Her' ? 'border-[#B89A62] bg-[#101617] text-[#F2EFE8]' : 'border-white/10 text-[#8F9897]'
                  }`}
                >
                  FOR HER
                </button>
                <button 
                  onClick={() => { setCategoryFilter('niche'); setGenderFilter(null); }}
                  className={`px-4 py-2 border transition-all ${
                    categoryFilter === 'niche' ? 'border-[#B89A62] bg-[#101617] text-[#F2EFE8]' : 'border-white/10 text-[#8F9897]'
                  }`}
                >
                  NICHE
                </button>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => handleSelectProduct(product.id)}
                className="group cursor-pointer p-6 bg-[#101617] border border-white/[0.06] hover:border-[#B89A62]/50 transition-all rounded-xs flex flex-col justify-between"
              >
                <div className="h-64 w-full flex items-center justify-center p-4 overflow-hidden">
                  <img 
                    src={product.image || "/images/oud_wood.jpg"} 
                    onError={(e) => { e.target.src = "/images/oud_wood.jpg"; }}
                    alt={product.name} 
                    className="max-h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="pt-4 space-y-1">
                  <span className="font-interface-sans text-[9px] tracking-[0.3em] text-[#8F9897] uppercase">
                    {product.brand}
                  </span>
                  <h3 className="font-editorial-serif text-2xl text-[#F2EFE8] group-hover:text-[#B89A62] transition-colors">
                    {product.name}
                  </h3>
                  <p className="font-interface-sans text-[11px] text-[#8F9897] font-light">
                    {product.fragranceFamily} · {product.concentration}
                  </p>
                  
                  <div className="pt-3 flex items-center justify-between border-t border-white/[0.04]">
                    <span className="font-interface-sans text-xs font-semibold text-[#F2EFE8]">
                      ₹{product.price ? product.price.toLocaleString('en-IN') : '21,500'}
                    </span>
                    <span className="font-interface-sans text-[10px] text-[#B89A62] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      VIEW →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      )}

      {/* FOOTER */}
      <FooterSection 
        onNavigate={(tab, gFilter, cFilter) => {
          if (gFilter) setGenderFilter(gFilter);
          if (cFilter) setCategoryFilter(cFilter);
          setActiveTab(tab);
        }}
      />

      {/* CART DRAWER */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      {/* SEARCH MODAL */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        productsData={ENRICHED_PRODUCTS}
        onSelectProduct={handleSelectProduct}
      />

    </div>
  );
}
