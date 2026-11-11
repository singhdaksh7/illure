import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AnnouncementBar from './components/AnnouncementBar';
import HeroSection from './components/HeroSection';
import EditorialIntroSection from './components/EditorialIntroSection';
import FeaturedFragrancesSection from './components/FeaturedFragrancesSection';
import CollectionsSection from './components/CollectionsSection';
import CinematicBrandMoment from './components/CinematicBrandMoment';
import ShopByMoodSection from './components/ShopByMoodSection';
import BrandStorySection from './components/BrandStorySection';
import BrandsMarqueeSection from './components/BrandsMarqueeSection';
import BestsellersSection from './components/BestsellersSection';
import NewArrivalSection from './components/NewArrivalSection';
import AuthenticitySection from './components/AuthenticitySection';
import NewsletterSection from './components/NewsletterSection';
import FooterSection from './components/FooterSection';
import CatalogView from './components/CatalogView';
import ProductDetailPage from './components/ProductDetailPage';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import CustomCursor from './components/CustomCursor';
import IntroOverlay from './components/IntroOverlay';

// Lazy-load optional discovery modals for optimal code-splitting
const ScentFinderModal = React.lazy(() => import('./components/discovery/ScentFinderModal'));
const NotesExplorerModal = React.lazy(() => import('./components/discovery/NotesExplorerModal'));
const FragranceCompareModal = React.lazy(() => import('./components/discovery/FragranceCompareModal'));
const DiscoverySetBuilder = React.lazy(() => import('./components/discovery/DiscoverySetBuilder'));
import AdminPortal from './admin/AdminPortal';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import CustomerAccountPage from './pages/CustomerAccountPage';
import NotFoundPage from './pages/NotFoundPage';

import { CmsProvider, useCms } from './context/CmsContext';
import { CustomerAuthProvider, useCustomerAuth } from './context/CustomerAuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { FeaturesProvider } from './context/FeaturesContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { productsApi } from './api/products';
import { PRODUCTS } from './data/products';

// Fallback initial dataset enriched with local high-res imagery
const ENRICHED_PRODUCTS = PRODUCTS.map((p) => {
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

function StorefrontApp() {
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  });

  const { isSectionVisible } = useCms();
  const { cart, addToCart, isCartOpen, setIsCartOpen } = useCart();
  const { isAuthenticated } = useCustomerAuth();

  const [productsList, setProductsList] = useState(ENRICHED_PRODUCTS);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'product' | 'shop' | 'checkout' | 'order-success' | 'login' | 'register' | 'account' | '404'
  const [selectedProductId, setSelectedProductId] = useState('tf-oud-wood');
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [noteFilter, setNoteFilter] = useState(null);
  const [isScentFinderOpen, setIsScentFinderOpen] = useState(false);
  const [isNotesExplorerOpen, setIsNotesExplorerOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [comparedProducts, setComparedProducts] = useState([]);

  // Synchronize dynamic products from live catalog API
  useEffect(() => {
    productsApi.list()
      .then((res) => {
        if (res?.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
          const liveItems = res.data.items.map((item) => {
            const fallback = ENRICHED_PRODUCTS.find((p) => p.id === item.id || p.slug === item.slug);
            return {
              ...fallback,
              ...item,
              image: item.primaryImage?.url || item.images?.[0]?.url || fallback?.image || '/images/illure-placeholder.svg',
              brand: item.referenceBrand?.name || fallback?.brand || 'İLLURÊ RESERVE',
              price: item.minPrice && Number(item.minPrice) > 0 
                ? Number(item.minPrice) 
                : (item.variants?.[0]?.price && Number(item.variants[0].price) > 0 
                    ? Number(item.variants[0].price) 
                    : (fallback?.price || null)),
            };
          });
          setProductsList(liveItems);
          if (liveItems.length > 0 && selectedProductId === 'tf-oud-wood') {
            setSelectedProductId(liveItems[0].id);
          }
        }
      })
      .catch((err) => {
        console.warn('Live catalog load notice, falling back to archive:', err);
      });
  }, []);

  // Sync route on popstate
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setIsAdminRoute(path.startsWith('/admin'));
      if (path === '/' || path === '') setActiveTab('home');
      else if (path.startsWith('/shop')) setActiveTab('shop');
      else if (path.startsWith('/discovery-set')) setActiveTab('discovery-set');
      else if (path.startsWith('/checkout')) setActiveTab('checkout');
      else if (path.startsWith('/login')) setActiveTab('login');
      else if (path.startsWith('/register')) setActiveTab('register');
      else if (path.startsWith('/account')) setActiveTab('account');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, selectedProductId]);

  if (isAdminRoute) {
    return (
      <AdminPortal
        onGoToStore={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
          setActiveTab('home');
        }}
      />
    );
  }

  const handleSelectProduct = (id) => {
    setSelectedProductId(id);
    setActiveTab('product');
  };

  const handleAddToCartItem = async (productObj) => {
    try {
      if (productObj.variantId) {
        await addToCart({
          variantId: productObj.variantId,
          quantity: productObj.quantity || 1,
          giftPackagingId: productObj.giftPackagingId || null,
          giftMessage: productObj.giftMessage || null,
        });
      }
    } catch {
      // Local fallback handled by CartContext
    }
    setIsCartOpen(true);
  };

  const handleNavigate = (tab, gFilter = null, cFilter = null) => {
    if (gFilter) setGenderFilter(gFilter);
    if (cFilter) setCategoryFilter(cFilter);
    setActiveTab(tab);
  };

  const handleOrderCompleted = (orderNumber) => {
    setConfirmedOrderNumber(orderNumber);
    setActiveTab('order-success');
  };

  const cartCount = cart?.itemCount || (cart?.items || []).reduce((acc, i) => acc + i.quantity, 0);

  // Map cart items for drawer
  const drawerItems = (cart?.items || []).map((item) => ({
    id: item.variant?.product?.id || item.id,
    name: item.variant?.product?.name || item.name || 'Extrait de Parfum',
    brand: item.variant?.product?.referenceBrand?.name || item.brand || 'İLLURÊ RESERVE',
    price: item.unitPrice ? Number(item.unitPrice) : (item.price ? Number(item.price) : 0),
    selectedSize: item.variant?.sizeLabel || (item.variant?.sizeMl ? `${item.variant.sizeMl} ML` : (item.selectedSize || 'Flacon')),
    quantity: item.quantity,
    image: item.variant?.product?.images?.[0] || item.image || '/images/illure-placeholder.svg',
    giftPackaging: !!item.giftPackagingId,
  }));

  return (
    <div className="min-h-screen bg-[#080C0D] text-[#F2EFE8] relative overflow-x-hidden selection:bg-[#B89A62] selection:text-[#080C0D]">
      {/* Intro Brand Overlay */}
      <IntroOverlay />

      {/* Custom Desktop Cursor */}
      <CustomCursor />

      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Navigation Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenScentFinder={() => setIsScentFinderOpen(true)}
        onOpenNotesExplorer={() => setIsNotesExplorerOpen(true)}
        cartCount={cartCount}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
        onSelectCategory={(cat) => {
          setCategoryFilter(cat);
          setActiveTab('shop');
        }}
        onSelectGender={(g) => {
          setGenderFilter(g);
          setActiveTab('shop');
        }}
      />

      {/* VIEW RENDERER */}
      {activeTab === 'home' && (
        <main>
          {/* 1. HOMEPAGE HERO (Reference Inspired Dark Cinematic Opening) */}
          {isSectionVisible('hero') && (
            <HeroSection
              onExplore={() => {
                const el = document.getElementById('curated-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onProductSelect={handleSelectProduct}
            />
          )}

          {/* 2. SECTION 2 — EDITORIAL BRAND STATEMENT */}
          {isSectionVisible('editorial_intro') && (
            <EditorialIntroSection
              onDiscover={() => {
                setActiveTab('shop');
              }}
            />
          )}

          {/* 3. SECTION 3 — FEATURED FRAGRANCES (01 / CURATED) */}
          {isSectionVisible('featured_fragrances') && (
            <div id="curated-section">
              <FeaturedFragrancesSection
                products={productsList}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCartItem}
              />
            </div>
          )}

          {/* 4. SECTION 4 — COLLECTIONS (02 / DISCOVER) */}
          {isSectionVisible('collections') && (
            <CollectionsSection
              onSelectCollection={(gFilter, cFilter) => {
                setGenderFilter(gFilter);
                setCategoryFilter(cFilter);
                setActiveTab('shop');
              }}
            />
          )}

          {/* 5. SECTION 5 — CINEMATIC BRAND MOMENT */}
          {isSectionVisible('cinematic_moment') && <CinematicBrandMoment />}

          {/* 6. SECTION 6 — SHOP BY MOOD (03 / CHARACTER) */}
          {isSectionVisible('shop_by_mood') && (
            <ShopByMoodSection
              onSelectMood={(moodId) => {
                setCategoryFilter(moodId);
                setActiveTab('shop');
              }}
            />
          )}

          {/* 7. SECTION 7 — BRAND STORY */}
          {isSectionVisible('brand_story') && (
            <BrandStorySection onDiscoverStory={() => setActiveTab('shop')} />
          )}

          {/* 8. SECTION 8 — BRANDS MARQUEE */}
          <BrandsMarqueeSection />

          {/* 9. SECTION 9 — BESTSELLERS (SIGNATURE REPERTORY) */}
          {isSectionVisible('bestsellers') && (
            <BestsellersSection
              products={productsList}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCartItem}
            />
          )}

          {/* 10. SECTION 10 — NEW ARRIVAL CAMPAIGN */}
          {isSectionVisible('new_arrivals') && (
            <NewArrivalSection 
              products={productsList}
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCartItem}
            />
          )}

          {/* 11. SECTION 11 — AUTHENTICITY PILLARS */}
          {isSectionVisible('authenticity') && <AuthenticitySection />}

          {/* 12. SECTION 12 — PRIVATE NOTES NEWSLETTER */}
          {isSectionVisible('newsletter') && <NewsletterSection />}
        </main>
      )}

      {/* CATALOG / SHOP VIEW */}
      {activeTab === 'shop' && (
        <CatalogView
          products={productsList}
          onSelectProduct={handleSelectProduct}
          onAddToCart={handleAddToCartItem}
          initialGender={genderFilter}
          initialCategory={categoryFilter}
          noteFilter={noteFilter}
          onClearNoteFilter={() => setNoteFilter(null)}
        />
      )}

      {/* DISCOVERY SET BUILDER VIEW */}
      {activeTab === 'discovery-set' && (
        <main>
          <React.Suspense
            fallback={
              <div className="pt-32 text-center text-[#D8BE82] font-editorial-serif tracking-widest text-sm">
                Assembling Discovery Set...
              </div>
            }
          >
            <DiscoverySetBuilder
              slug="custom-discovery-set"
              onBack={() => {
                window.history.pushState({}, '', '/shop');
                setActiveTab('shop');
              }}
            />
          </React.Suspense>
        </main>
      )}

      {/* PRODUCT DETAIL PAGE */}
      {activeTab === 'product' && (
        <main>
          <ProductDetailPage
            productId={selectedProductId}
            productsData={productsList}
            onBack={() => setActiveTab('home')}
            onAddToCart={handleAddToCartItem}
            onSelectProduct={handleSelectProduct}
            onCompareProduct={(prod) => {
              setComparedProducts((prev) => {
                if (prev.some((p) => p.id === prod.id)) return prev;
                return [...prev, prod].slice(-3);
              });
              setIsCompareOpen(true);
            }}
          />
        </main>
      )}

      {/* CHECKOUT VIEW */}
      {activeTab === 'checkout' && (
        <main>
          <CheckoutPage
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderCompleted}
          />
        </main>
      )}

      {/* ORDER SUCCESS VIEW */}
      {activeTab === 'order-success' && (
        <main>
          <OrderSuccessPage
            orderNumber={confirmedOrderNumber || 'ILL-ORD-DEMO'}
            onNavigate={handleNavigate}
          />
        </main>
      )}

      {/* CUSTOMER AUTH VIEWS */}
      {activeTab === 'login' && (
        <CustomerLoginPage onNavigate={handleNavigate} />
      )}

      {activeTab === 'register' && (
        <CustomerRegisterPage onNavigate={handleNavigate} />
      )}

      {activeTab === 'account' && (
        <CustomerAccountPage onNavigate={handleNavigate} />
      )}

      {/* 404 FALLBACK */}
      {activeTab === '404' && (
        <NotFoundPage onNavigate={handleNavigate} />
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
        cartItems={drawerItems}
        onNavigateToCheckout={() => setActiveTab('checkout')}
      />

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        productsData={productsList}
        onSelectProduct={handleSelectProduct}
      />

      {/* DISCOVERY: OPTIONAL LAZY MODALS */}
      <React.Suspense fallback={null}>
        {/* SCENT FINDER QUIZ MODAL (FEATURE 01) */}
        {isScentFinderOpen && (
          <ScentFinderModal
            isOpen={isScentFinderOpen}
            onClose={() => setIsScentFinderOpen(false)}
            products={productsList}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* EXPLORE BY NOTE MODAL (FEATURE 08) */}
        {isNotesExplorerOpen && (
          <NotesExplorerModal
            isOpen={isNotesExplorerOpen}
            onClose={() => setIsNotesExplorerOpen(false)}
            products={productsList}
            onSelectNoteFilter={(note) => {
              setNoteFilter(note);
              setActiveTab('shop');
            }}
          />
        )}

        {/* COMPARE FRAGRANCES MODAL (FEATURE 06) */}
        {isCompareOpen && (
          <FragranceCompareModal
            isOpen={isCompareOpen}
            onClose={() => setIsCompareOpen(false)}
            comparedProducts={comparedProducts}
            onRemoveProduct={(id) => {
              setComparedProducts((prev) => prev.filter((p) => p.id !== id));
            }}
            onAddToCart={handleAddToCartItem}
            onViewProduct={handleSelectProduct}
          />
        )}
      </React.Suspense>
    </div>
  );
}

export default function App() {
  return (
    <FeaturesProvider>
      <CmsProvider>
        <CustomerAuthProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <CartProvider>
                <StorefrontApp />
              </CartProvider>
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CustomerAuthProvider>
      </CmsProvider>
    </FeaturesProvider>
  );
}
