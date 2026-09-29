import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { PRODUCTS } from '../data/products';

export default function BestsellersSection({ 
  onSelectProduct, 
  onAddToCart, 
  onToggleWishlist,
  wishlist = []
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const filteredProducts = PRODUCTS.filter(p => {
    if (activeFilter === 'HIM') return p.gender === 'Him';
    if (activeFilter === 'HER') return p.gender === 'Her';
    if (activeFilter === 'UNISEX') return p.gender === 'Unisex';
    if (activeFilter === 'NICHE') return p.niche === true;
    return true; // ALL
  });

  return (
    <section className="py-24 bg-[#080B0D] relative z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-sans-clean text-xs font-semibold tracking-[0.3em] text-[#D4AF37] uppercase block mb-2">
            THE BESTSELLERS
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#F4F1EA] font-light tracking-wide mb-4">
            SIGNATURE SELECTIONS
          </h2>
          <p className="font-sans-clean text-sm text-[#A39E93] tracking-wide font-light">
            Fragrances chosen by those who understand the power of presence.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center justify-center space-x-4 sm:space-x-8 mb-16 overflow-x-auto pb-4 no-scrollbar">
          {['ALL', 'HIM', 'HER', 'UNISEX', 'NICHE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`font-sans-clean text-xs tracking-[0.25em] uppercase py-2 px-4 rounded-full transition-all duration-300 ${
                activeFilter === tab
                  ? 'bg-[#D4AF37] text-[#080B0D] font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                  : 'text-[#A39E93] hover:text-[#F4F1EA] bg-white/[0.03] border border-white/5'
              }`}
            >
              {tab === 'HIM' ? 'FOR HIM' : tab === 'HER' ? 'FOR HER' : tab}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
