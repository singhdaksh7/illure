import React, { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, ChevronDown, X, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

export default function CatalogView({
  products = [],
  onSelectProduct,
  onAddToCart,
  initialGender = null,
  initialCategory = null,
  noteFilter = null,
  onClearNoteFilter,
}) {
  // Read initial query params from URL if present
  const getInitialParam = (param) => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get(param);
    } catch {
      return null;
    }
  };

  const [genderFilter, setGenderFilter] = useState(() => initialGender || getInitialParam('gender'));
  const [familyFilter, setFamilyFilter] = useState(() => initialCategory || getInitialParam('family'));
  const [occasionFilter, setOccasionFilter] = useState(() => getInitialParam('occasion'));
  const [seasonFilter, setSeasonFilter] = useState(() => getInitialParam('season'));
  const [sortBy, setSortBy] = useState(() => getInitialParam('sort') || 'featured');
  const [inStockOnly, setInStockOnly] = useState(() => getInitialParam('inStock') === 'true');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [facets, setFacets] = useState(null);

  // Sync URL search parameters on filter changes without reloading
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (genderFilter) url.searchParams.set('gender', genderFilter);
      else url.searchParams.delete('gender');

      if (familyFilter) url.searchParams.set('family', familyFilter);
      else url.searchParams.delete('family');

      if (occasionFilter) url.searchParams.set('occasion', occasionFilter);
      else url.searchParams.delete('occasion');

      if (seasonFilter) url.searchParams.set('season', seasonFilter);
      else url.searchParams.delete('season');

      if (inStockOnly) url.searchParams.set('inStock', 'true');
      else url.searchParams.delete('inStock');

      if (sortBy !== 'featured') url.searchParams.set('sort', sortBy);
      else url.searchParams.delete('sort');

      window.history.replaceState({}, '', url.toString());
    } catch (err) {
      console.warn('URL sync error:', err);
    }
  }, [genderFilter, familyFilter, occasionFilter, seasonFilter, inStockOnly, sortBy]);

  // Fetch catalog facets from backend for dynamic filters
  useEffect(() => {
    fetch('/api/products/facets')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.facets) {
          setFacets(json.data.facets);
        }
      })
      .catch((err) => console.warn('Facets fetch error:', err));
  }, []);

  // Synchronize when parent passes updated props
  useEffect(() => {
    if (initialCategory !== undefined && initialCategory !== null) setFamilyFilter(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialGender !== undefined && initialGender !== null) setGenderFilter(initialGender);
  }, [initialGender]);

  const fragranceFamilies = facets?.families?.length
    ? facets.families
    : ['Woody & Smoky', 'Fresh & Aquatic', 'Amber & Oriental', 'Floral & Powdery', 'Gourmand', 'Niche Editions'];

  const availableOccasions = facets?.occasions?.length
    ? facets.occasions
    : ['Daily Wear / Office', 'Intimate / Date Night', 'Evening Gala / Formal', 'Casual / Weekend'];

  const availableSeasons = facets?.seasons?.length
    ? facets.seasons
    : ['Spring', 'Summer', 'Autumn', 'Winter', 'All Seasons'];

  // Filtering & Sorting logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Note filter
        if (noteFilter) {
          const allNotes = [...(p.topNotes || []), ...(p.heartNotes || []), ...(p.baseNotes || [])].map((n) =>
            n.toLowerCase()
          );
          const matchNote = allNotes.some(
            (n) => n.includes(noteFilter.toLowerCase()) || noteFilter.toLowerCase().includes(n)
          );
          if (!matchNote) return false;
        }

        // Gender filter
        if (genderFilter && p.gender !== genderFilter && p.gender !== 'UNISEX' && p.gender !== 'Unisex') {
          return false;
        }

        // Fragrance family filter
        if (familyFilter && familyFilter !== 'all') {
          const target = familyFilter.toLowerCase();
          const matchFam = p.fragranceFamily?.toLowerCase().includes(target);
          const matchCat = p.category?.toLowerCase() === target;
          const matchNiche = target === 'niche' && p.niche;
          const matchMood =
            (target === 'evening' &&
              (p.fragranceFamily?.toLowerCase().includes('wood') ||
                p.fragranceFamily?.toLowerCase().includes('amber') ||
                p.fragranceFamily?.toLowerCase().includes('oud'))) ||
            (target === 'after-dark' &&
              (p.fragranceFamily?.toLowerCase().includes('wood') ||
                p.fragranceFamily?.toLowerCase().includes('oud') ||
                p.fragranceFamily?.toLowerCase().includes('amber'))) ||
            (target === 'day' &&
              (p.fragranceFamily?.toLowerCase().includes('fresh') ||
                p.fragranceFamily?.toLowerCase().includes('citrus'))) ||
            (target === 'first-impression' &&
              (p.fragranceFamily?.toLowerCase().includes('fresh') ||
                p.fragranceFamily?.toLowerCase().includes('citrus'))) ||
            (target === 'signature' && p.bestseller) ||
            (target === 'everyday' && (p.bestseller || p.fragranceFamily?.toLowerCase().includes('woody'))) ||
            (target === 'date-night' &&
              (p.fragranceFamily?.toLowerCase().includes('amber') ||
                p.fragranceFamily?.toLowerCase().includes('spicy'))) ||
            (target === 'the-weekend' &&
              (p.fragranceFamily?.toLowerCase().includes('fresh') ||
                p.fragranceFamily?.toLowerCase().includes('citrus')));

          if (!matchFam && !matchCat && !matchNiche && !matchMood) return false;
        }

        // Occasion filter
        if (occasionFilter && occasionFilter !== 'all') {
          if (!p.occasion || !p.occasion.toLowerCase().includes(occasionFilter.toLowerCase())) {
            return false;
          }
        }

        // Season filter
        if (seasonFilter && seasonFilter !== 'all') {
          if (!p.season || !p.season.toLowerCase().includes(seasonFilter.toLowerCase())) {
            return false;
          }
        }

        // In Stock filter
        if (inStockOnly) {
          const hasStock = (p.variants || []).some((v) => Number(v.stockQuantity) > 0);
          if (p.variants && p.variants.length > 0 && !hasStock) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const pricesA = (a.variants || []).map((v) => Number(v.price)).filter((p) => !isNaN(p) && p > 0);
        const pricesB = (b.variants || []).map((v) => Number(v.price)).filter((p) => !isNaN(p) && p > 0);
        const priceA = pricesA.length ? Math.min(...pricesA) : Number(a.minPrice || a.price || 0);
        const priceB = pricesB.length ? Math.min(...pricesB) : Number(b.minPrice || b.price || 0);

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
        return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
      });
  }, [products, genderFilter, familyFilter, occasionFilter, seasonFilter, inStockOnly, sortBy, noteFilter]);

  const clearAllFilters = () => {
    setGenderFilter(null);
    setFamilyFilter(null);
    setOccasionFilter(null);
    setSeasonFilter(null);
    setInStockOnly(false);
    setSortBy('featured');
    if (onClearNoteFilter) onClearNoteFilter();
  };

  const hasActiveFilters =
    genderFilter || familyFilter || occasionFilter || seasonFilter || inStockOnly || sortBy !== 'featured' || noteFilter;

  return (
    <div className="pt-28 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen select-none">
      {/* Top Editorial Catalog Intro */}
      <div className="mb-14 space-y-4">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-[1px] bg-[#C7A866]" />
          <span className="typography-eyebrow text-[#D8BE82]">THE CATALOG</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="typography-display text-[#F7F3EA]">ALL FRAGRANCES</h1>
          </div>
          <p className="typography-body max-w-md text-xs md:text-sm text-[#AAA297]">
            Familiar profiles. Distinct character. Concentrated extrait formulations designed to be worn anywhere.
          </p>
        </div>

        {/* ACTIVE FILTER BADGES */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-[#C7A866] uppercase tracking-widest font-interface-sans font-medium">
              ACTIVE FILTERS:
            </span>
            {noteFilter && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#14120F] border border-[#D8BE82]/40 rounded-xs text-xs text-[#D8BE82]">
                <span>Note: {noteFilter}</span>
                <button onClick={onClearNoteFilter} className="hover:text-[#F7F3EA] text-[#AAA297] ml-1 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {familyFilter && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#14120F] border border-[#D8BE82]/40 rounded-xs text-xs text-[#D8BE82]">
                <span>Family: {familyFilter}</span>
                <button onClick={() => setFamilyFilter(null)} className="hover:text-[#F7F3EA] text-[#AAA297] ml-1 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {occasionFilter && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#14120F] border border-[#D8BE82]/40 rounded-xs text-xs text-[#D8BE82]">
                <span>Occasion: {occasionFilter}</span>
                <button onClick={() => setOccasionFilter(null)} className="hover:text-[#F7F3EA] text-[#AAA297] ml-1 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {seasonFilter && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#14120F] border border-[#D8BE82]/40 rounded-xs text-xs text-[#D8BE82]">
                <span>Season: {seasonFilter}</span>
                <button onClick={() => setSeasonFilter(null)} className="hover:text-[#F7F3EA] text-[#AAA297] ml-1 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {genderFilter && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#14120F] border border-[#D8BE82]/40 rounded-xs text-xs text-[#D8BE82]">
                <span>Gender: {genderFilter}</span>
                <button onClick={() => setGenderFilter(null)} className="hover:text-[#F7F3EA] text-[#AAA297] ml-1 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-[#C7A866] hover:text-[#F7F3EA] underline uppercase tracking-wider ml-2 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* ==================================================
          HORIZONTAL LUXURY FILTER & SORT BAR (DESKTOP)
          ================================================== */}
      <div className="mb-10 pb-6 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        {/* Left: Quick Gender & Family Filters */}
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          {/* GENDER FILTERS */}
          <button
            onClick={() => setGenderFilter(null)}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all cursor-pointer ${
              !genderFilter
                ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA] shadow-[0_0_10px_rgba(199,168,102,0.15)]'
                : 'border-white/[0.08] text-[#AAA297] hover:border-white/20'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setGenderFilter(genderFilter === 'Him' || genderFilter === 'MEN' ? null : 'MEN')}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all cursor-pointer ${
              genderFilter === 'Him' || genderFilter === 'MEN'
                ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA] shadow-[0_0_10px_rgba(199,168,102,0.15)]'
                : 'border-white/[0.08] text-[#AAA297] hover:border-white/20'
            }`}
          >
            MEN
          </button>
          <button
            onClick={() => setGenderFilter(genderFilter === 'Her' || genderFilter === 'WOMEN' ? null : 'WOMEN')}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all cursor-pointer ${
              genderFilter === 'Her' || genderFilter === 'WOMEN'
                ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA] shadow-[0_0_10px_rgba(199,168,102,0.15)]'
                : 'border-white/[0.08] text-[#AAA297] hover:border-white/20'
            }`}
          >
            WOMEN
          </button>
          <button
            onClick={() => setGenderFilter(genderFilter === 'Unisex' || genderFilter === 'UNISEX' ? null : 'UNISEX')}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all cursor-pointer ${
              genderFilter === 'Unisex' || genderFilter === 'UNISEX'
                ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA] shadow-[0_0_10px_rgba(199,168,102,0.15)]'
                : 'border-white/[0.08] text-[#AAA297] hover:border-white/20'
            }`}
          >
            UNISEX
          </button>

          <span className="w-4 h-[1px] bg-white/[0.1] mx-1" />

          {/* FRAGRANCE FAMILY FILTER DROPDOWN */}
          <div className="relative group">
            <select
              value={familyFilter || ''}
              onChange={(e) => setFamilyFilter(e.target.value || null)}
              className="bg-[#0E1011] border border-white/[0.08] hover:border-[#C7A866]/40 text-[#F7F3EA] px-3.5 py-1.5 rounded-xs text-xs font-interface-sans tracking-wider uppercase focus:outline-none focus:border-[#C7A866] cursor-pointer"
            >
              <option value="">ALL FAMILIES</option>
              {fragranceFamilies.map((fam) => (
                <option key={fam} value={fam}>
                  {fam}
                </option>
              ))}
            </select>
          </div>

          {/* OCCASION FILTER DROPDOWN */}
          <div className="relative group">
            <select
              value={occasionFilter || ''}
              onChange={(e) => setOccasionFilter(e.target.value || null)}
              className="bg-[#0E1011] border border-white/[0.08] hover:border-[#C7A866]/40 text-[#F7F3EA] px-3.5 py-1.5 rounded-xs text-xs font-interface-sans tracking-wider uppercase focus:outline-none focus:border-[#C7A866] cursor-pointer"
            >
              <option value="">ALL OCCASIONS</option>
              {availableOccasions.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* IN STOCK TOGGLE */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-3.5 py-1.5 text-xs font-interface-sans tracking-widest uppercase border rounded-xs transition-all cursor-pointer ${
              inStockOnly
                ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA]'
                : 'border-white/[0.08] text-[#AAA297] hover:border-white/20'
            }`}
          >
            IN STOCK ONLY
          </button>
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="lg:hidden flex items-center space-x-2">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#14120F] border border-white/[0.1] text-xs tracking-wider uppercase rounded-xs text-[#F7F3EA] cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C7A866]" />
            <span>FILTERS</span>
            {hasActiveFilters && <span className="w-2 h-2 bg-[#C7A866] rounded-full" />}
          </button>
        </div>

        {/* Right: Sort UI & Flacon Counter */}
        <div className="flex items-center space-x-4">
          <span className="text-xs text-[#AAA297] font-mono tracking-wider hidden sm:inline">
            {filteredProducts.length} FRAGRANCES
          </span>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] tracking-widest text-[#AAA297] uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0E1011] border border-white/[0.1] text-[#F7F3EA] text-xs font-interface-sans tracking-wider px-3 py-1.5 rounded-xs focus:outline-none focus:border-[#C7A866] cursor-pointer uppercase"
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
        <div className="py-28 text-center space-y-4 border border-white/[0.04] bg-[#0E1011]/50 rounded-xs">
          <Sparkles className="w-8 h-8 text-[#C7A866] mx-auto opacity-60" />
          <h3 className="font-editorial-serif text-3xl text-[#F7F3EA]">No creations match your current criteria.</h3>
          <p className="text-xs text-[#AAA297] font-light max-w-sm mx-auto">
            Try resetting your filters or exploring our full repertoire.
          </p>
          <div className="pt-4">
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-[#C7A866] text-[#080A0B] font-semibold text-xs tracking-widest uppercase rounded-xs cursor-pointer hover:bg-[#D8BE82] transition-colors"
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
            className="fixed inset-0 bg-[#080A0B]/80 backdrop-blur-md"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative bg-[#0E1011] border-t border-[#C7A866]/30 p-6 rounded-t-lg z-10 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <span className="font-editorial-serif text-xl uppercase text-[#F7F3EA]">FILTER FRAGRANCES</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-[#AAA297]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <span className="text-[10px] tracking-widest text-[#D8BE82] uppercase block">GENDER IDENTITY</span>
              <div className="grid grid-cols-4 gap-2">
                {['ALL', 'MEN', 'WOMEN', 'UNISEX'].map((g) => {
                  const isSel = (!genderFilter && g === 'ALL') || genderFilter === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g === 'ALL' ? null : g)}
                      className={`py-2 text-xs border rounded-xs uppercase tracking-wider ${
                        isSel ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA]' : 'border-white/10 text-[#AAA297]'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Families */}
            <div className="space-y-2">
              <span className="text-[10px] tracking-widest text-[#D8BE82] uppercase block">OLFACTIVE FAMILY</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFamilyFilter(null)}
                  className={`p-2 text-xs border rounded-xs text-left uppercase ${
                    !familyFilter ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA]' : 'border-white/10 text-[#AAA297]'
                  }`}
                >
                  All Families
                </button>
                {fragranceFamilies.map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setFamilyFilter(fam)}
                    className={`p-2 text-xs border rounded-xs text-left uppercase truncate ${
                      familyFilter === fam
                        ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA]'
                        : 'border-white/10 text-[#AAA297]'
                    }`}
                  >
                    {fam}
                  </button>
                ))}
              </div>
            </div>

            {/* Occasions */}
            <div className="space-y-2">
              <span className="text-[10px] tracking-widest text-[#D8BE82] uppercase block">OCCASION</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOccasionFilter(null)}
                  className={`p-2 text-xs border rounded-xs text-left uppercase ${
                    !occasionFilter ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA]' : 'border-white/10 text-[#AAA297]'
                  }`}
                >
                  All Occasions
                </button>
                {availableOccasions.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setOccasionFilter(occ)}
                    className={`p-2 text-xs border rounded-xs text-left uppercase truncate ${
                      occasionFilter === occ
                        ? 'border-[#C7A866] bg-[#14120F] text-[#F7F3EA]'
                        : 'border-white/10 text-[#AAA297]'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center space-x-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 border border-white/20 text-[#AAA297] text-xs uppercase tracking-widest rounded-xs"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#C7A866] text-[#080A0B] text-xs font-semibold uppercase tracking-widest rounded-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
