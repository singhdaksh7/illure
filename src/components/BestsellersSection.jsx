import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { PRODUCTS } from '../data/products';
import { useCms } from '../context/CmsContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BestsellersSection({ 
  onSelectProduct, 
  onAddToCart,
}) {
  const { getSection } = useCms();
  const section = getSection('bestsellers');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'THE SIGNATURE REPERTORY';
  const subtitle = section?.subtitle || 'MOST SOUGHT AFTER';
  const description = section?.description || 'The definitive fragrances chosen repeatedly by our distinguished patrons.';

  const filteredProducts = PRODUCTS.filter(p => {
    if (activeFilter === 'HIM') return p.gender === 'Him';
    if (activeFilter === 'HER') return p.gender === 'Her';
    if (activeFilter === 'UNISEX') return p.gender === 'Unisex';
    if (activeFilter === 'NICHE') return p.niche === true;
    return true; // ALL
  });

  const visibleProducts = filteredProducts.slice(carouselIndex, carouselIndex + 4);

  return (
    <section 
      id="bestsellers-section" 
      className="py-24 md:py-36 bg-[#0B0B0C] relative select-none border-b border-white/[0.04]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[1px] bg-[#B89A62]" />
              <span className="typography-eyebrow">
                {subtitle}
              </span>
            </div>
            <h2 className="typography-h1 text-[#F7F4EE]">
              {title}
            </h2>
            <p className="typography-body max-w-md">
              {description}
            </p>
          </div>

          {/* Minimal Editorial Filter Row (Clean borders, NOT rounded SaaS pills) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-interface-sans tracking-widest uppercase">
            {['ALL', 'HIM', 'HER', 'UNISEX', 'NICHE'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveFilter(tab);
                  setCarouselIndex(0);
                }}
                className={`px-4 py-2 border rounded-xs transition-all ${
                  activeFilter === tab
                    ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE] shadow-[0_0_12px_rgba(184,154,98,0.12)]'
                    : 'border-white/[0.08] text-[#A1A1AA] hover:border-white/20'
                }`}
              >
                {tab === 'HIM' ? 'FOR HIM' : tab === 'HER' ? 'FOR HER' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Controlled Editorial Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Carousel Controls if more products exist */}
        {filteredProducts.length > 4 && (
          <div className="flex items-center justify-between pt-10 border-t border-white/[0.04] mt-8">
            <span className="text-xs tracking-widest text-[#A1A1AA] font-mono">
              SHOWING {carouselIndex + 1}–{Math.min(filteredProducts.length, carouselIndex + 4)} OF {filteredProducts.length} CREATIONS
            </span>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCarouselIndex(prev => Math.max(0, prev - 4))}
                disabled={carouselIndex === 0}
                className="p-3 bg-[#121214] border border-white/[0.08] hover:border-[#B89A62] text-[#F7F4EE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-xs"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCarouselIndex(prev => Math.min(filteredProducts.length - 4, prev + 4))}
                disabled={carouselIndex >= filteredProducts.length - 4}
                className="p-3 bg-[#121214] border border-white/[0.08] hover:border-[#B89A62] text-[#F7F4EE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-xs"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
