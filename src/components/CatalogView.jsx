import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ChevronDown, X, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

export default function CatalogView({
  products = [],
  onSelectProduct,
  onAddToCart,
  initialGender = null,
  initialCategory = null,
}) {
  const [genderFilter, setGenderFilter] = useState(initialGender);
  const [familyFilter, setFamilyFilter] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('featured'); // featured | newest | price-asc | price-desc | name
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available fragrance families
  const fragranceFamilies = [
    'Woody',
    'Fresh',
    'Amber',
    'Oud',
    'Citrus',
    'Floral',
    'Aromatic',
  ];

  // Filtering & Sorting logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Gender filter
        if (genderFilter && p.gender !== genderFilter && p.gender !== 'UNISEX' && p.gender !== 'Unisex') {
          return false;
        }

        // Fragrance family filter
        if (familyFilter && familyFilter !== 'all') {
          const matchFam = p.fragranceFamily?.toLowerCase().includes(familyFilter.toLowerCase());
          const matchCat = p.category?.toLowerCase() === familyFilter.toLowerCase();
          const matchNiche = familyFilter === 'niche' && p.niche;
          if (!matchFam && !matchCat && !matchNiche) return false;
        }

        // In Stock filter
        if (inStockOnly && p.status === 'DRAFT') return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
        return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0); // featured default
      });
  }, [products, genderFilter, familyFilter, inStockOnly, sortBy]);

  const clearAllFilters = () => {
    setGenderFilter(null);
    setFamilyFilter(null);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters = genderFilter || familyFilter || inStockOnly || sortBy !== 'featured';

  return (
    <div className="pt-28 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen select-none">
      
      {/* Top Editorial Catalog Intro */}
      <div className="mb-14 space-y-4">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-[1px] bg-[#B89A62]" />
          <span className="typography-eyebrow">
            THE PERFUMERY COMPENDIUM
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="typography-display text-[#F7F4EE]">
              SHOP İLLURÊ
            </h1>
          </div>
          <p className="typography-body max-w-md text-xs md:text-sm">
            Extrait formulations organized by reference architecture, olfactive character, and noble intensity. Handcrafted in limited batches.
          </p>
        </div>
      </div>

      {/* ==================================================
          HORIZONTAL MINIMAL FILTER & SORT BAR (DESKTOP)
          ================================================== */}
      <div className="mb-10 pb-6 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Quick Gender & Family Filters */}
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          {/* GENDER FILTERS */}
          <button
            onClick={() => setGenderFilter(null)}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all ${
              !genderFilter 
                ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE] shadow-[0_0_10px_rgba(184,154,98,0.15)]' 
                : 'border-white/[0.08] text-[#A1A1AA] hover:border-white/20'
            }`}
          >
            ALL GENDERS
          </button>
          <button
            onClick={() => setGenderFilter(genderFilter === 'Him' ? null : 'Him')}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all ${
              genderFilter === 'Him' 
                ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE] shadow-[0_0_10px_rgba(184,154,98,0.15)]' 
                : 'border-white/[0.08] text-[#A1A1AA] hover:border-white/20'
            }`}
          >
            FOR HIM
          </button>
          <button
            onClick={() => setGenderFilter(genderFilter === 'Her' ? null : 'Her')}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all ${
              genderFilter === 'Her' 
                ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE] shadow-[0_0_10px_rgba(184,154,98,0.15)]' 
                : 'border-white/[0.08] text-[#A1A1AA] hover:border-white/20'
            }`}
          >
            FOR HER
          </button>

          <span className="w-4 h-[1px] bg-white/[0.1] mx-1" />

          {/* FRAGRANCE FAMILY FILTER DROPDOWN */}
          <div className="relative group">
            <select
              value={familyFilter || ''}
              onChange={(e) => setFamilyFilter(e.target.value || null)}
              className="bg-[#121214] border border-white/[0.08] hover:border-[#B89A62]/40 text-[#F7F4EE] px-3.5 py-1.5 rounded-xs text-xs font-interface-sans tracking-wider uppercase focus:outline-none focus:border-[#B89A62] cursor-pointer"
            >
              <option value="">ALL FAMILIES</option>
              {fragranceFamilies.map((fam) => (
                <option key={fam} value={fam}>{fam}</option>
              ))}
              <option value="niche">NICHE RESERVE</option>
            </select>
          </div>

          {/* IN STOCK TOGGLE */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all ${
              inStockOnly
                ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE]'
                : 'border-white/[0.08] text-[#A1A1AA] hover:border-white/20'
            }`}
          >
            IN STOCK ONLY
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1 text-[11px] text-[#B89A62] hover:text-[#F7F4EE] underline uppercase tracking-wider ml-2"
            >
              RESET
            </button>
          )}
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="lg:hidden flex items-center space-x-2">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#121214] border border-white/[0.1] text-xs tracking-wider uppercase rounded-xs text-[#F7F4EE]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B89A62]" />
            <span>FILTERS</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-[#B89A62] rounded-full" />
            )}
          </button>
        </div>

        {/* Right: Sort UI & Flacon Counter */}
        <div className="flex items-center space-x-4">
          <span className="text-xs text-[#A1A1AA] font-mono tracking-wider hidden sm:inline">
            {filteredProducts.length} FLACONS
          </span>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] tracking-widest text-[#A1A1AA] uppercase">
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#121214] border border-white/[0.1] text-[#F7F4EE] text-xs font-interface-sans tracking-wider px-3 py-1.5 rounded-xs focus:outline-none focus:border-[#B89A62] cursor-pointer uppercase"
            >
              <option value="featured">FEATURED</option>
              <option value="newest">NEW ARRIVALS</option>
              <option value="price-asc">PRICE: LOW – HIGH</option>
              <option value="price-desc">PRICE: HIGH – LOW</option>
              <option value="name">NAME: A – Z</option>
            </select>
          </div>
        </div>

      </div>

      {/* ==================================================
          PRODUCTS EDITORIAL GRID
          ================================================== */}
      {filteredProducts.length === 0 ? (
        <div className="py-28 text-center space-y-4 border border-white/[0.04] bg-[#121214]/50 rounded-xs">
          <Sparkles className="w-8 h-8 text-[#B89A62] mx-auto opacity-60" />
          <h3 className="font-editorial-serif text-3xl text-[#F7F4EE]">
            No creations match your current criteria.
          </h3>
          <p className="text-xs text-[#A1A1AA] font-light max-w-sm mx-auto">
            Try resetting your gender or olfactive family filters to discover our wider repertoire.
          </p>
          <div className="pt-4">
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-[#B89A62] text-[#0B0B0C] font-semibold text-xs tracking-widest uppercase rounded-xs"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

      {/* ==================================================
          MOBILE BOTTOM SHEET FILTER DRAWER
          ================================================== */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-[#0B0B0C]/80 backdrop-blur-md"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative bg-[#121214] border-t border-[#B89A62]/30 p-6 rounded-t-lg z-10 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <span className="font-bodoni text-xl uppercase text-[#F7F4EE]">
                FILTER FRAGRANCES
              </span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1">
                <X className="w-5 h-5 text-[#A1A1AA]" />
              </button>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-[#B89A62] uppercase font-semibold">
                GENDER
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Him', 'Her', 'Unisex'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(genderFilter === g ? null : g)}
                    className={`py-2 text-xs border rounded-xs uppercase tracking-wider ${
                      genderFilter === g 
                        ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE]' 
                        : 'border-white/[0.08] text-[#A1A1AA]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Family */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-widest text-[#B89A62] uppercase font-semibold">
                FRAGRANCE FAMILY
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fragranceFamilies.map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setFamilyFilter(familyFilter === fam ? null : fam)}
                    className={`py-2 px-3 text-left text-xs border rounded-xs uppercase tracking-wider ${
                      familyFilter === fam 
                        ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE]' 
                        : 'border-white/[0.08] text-[#A1A1AA]'
                    }`}
                  >
                    {fam}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock */}
            <div className="flex items-center justify-between py-2 border-t border-white/[0.08]">
              <span className="text-xs uppercase tracking-wider text-[#F7F4EE]">IN STOCK ONLY</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#B89A62]"
              />
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 border border-white/[0.1] text-xs uppercase tracking-wider text-[#A1A1AA]"
              >
                RESET
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#B89A62] text-[#0B0B0C] font-semibold text-xs uppercase tracking-widest"
              >
                VIEW {filteredProducts.length} FLACONS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
