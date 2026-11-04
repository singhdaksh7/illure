import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { useCms } from '../context/CmsContext';

const DEFAULT_FEATURED = [
  {
    id: "2abf7036-537b-4701-96db-5ef6080eb398",
    brand: "TOM FORD",
    name: "Oud Silk Royal",
    inspiredByName: "Oud Wood",
    price: 349,
    minPrice: 349,
    formattedPrice: "₹349",
    image: "/images/oud_wood.jpg",
    notes: "Smoky Oud · Sandalwood · Cardamom",
    gender: "UNISEX",
    bestseller: true,
  },
  {
    id: "2bd9cff7-1ba5-4a81-8d7d-f50677bc7f2d",
    brand: "GIORGIO ARMANI",
    name: "Aqua Edge",
    inspiredByName: "Acqua di Giò",
    price: 299,
    minPrice: 299,
    formattedPrice: "₹299",
    image: "/images/sauvage.jpg",
    notes: "Bergamot · Marine Accord · White Musk",
    gender: "MEN",
    badge: "ICONIC",
  },
  {
    id: "6a8c6b87-8a0d-4215-bdd2-8dff37082a7e",
    brand: "CREED",
    name: "Imperial Sovereign",
    inspiredByName: "Aventus",
    price: 399,
    minPrice: 399,
    formattedPrice: "₹399",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
    notes: "Blackcurrant · Italian Bergamot · French Oakmoss",
    gender: "MEN",
    badge: "EXCLUSIVE",
  },
];

export default function FeaturedFragrancesSection({ 
  onSelectProduct, 
  onAddToCart,
  products = DEFAULT_FEATURED,
  onViewAll
}) {
  const { getSection } = useCms();
  const section = getSection('featured_fragrances');

  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'FEATURED CREATIONS';
  const subtitle = section?.subtitle || 'CURATED EXTRAITS';
  const description = section?.description || 'Rare formulations defined by depth, tension, and lingering warmth.';
  const layout = section?.layoutVariant || 'EDITORIAL'; // EDITORIAL | GRID | CAROUSEL

  const items = products.length > 0 ? products : DEFAULT_FEATURED;
  const leadProduct = items[0] || DEFAULT_FEATURED[0];
  const companionProducts = items.slice(1, 4);

  return (
    <section 
      id="curated-section" 
      className="py-24 md:py-36 bg-[#0B0B0C] relative select-none overflow-hidden border-b border-white/[0.04]"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/4 w-[60vw] h-[350px] bg-[#B89A62]/[0.025] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-20 space-y-4">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[1px] bg-[#B89A62]" />
            <span className="typography-eyebrow">
              {subtitle}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="typography-h1 text-[#F7F4EE]">
                {title}
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="typography-body max-w-sm">
                {description}
              </p>
              {onViewAll && (
                <button
                  onClick={onViewAll}
                  className="inline-flex items-center space-x-2 text-xs tracking-[0.25em] uppercase text-[#B89A62] hover:text-[#F7F4EE] transition-colors py-1 shrink-0"
                >
                  <span>VIEW ALL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LAYOUT 1: ASYMMETRIC EDITORIAL (1 Hero Flacon + 2 Companion Tiles) */}
        {layout === 'EDITORIAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Dominant Feature Flacon */}
            <div 
              className="lg:col-span-7 bg-[#121214] border border-[#B89A62]/30 p-8 md:p-12 relative overflow-hidden group cursor-pointer flex flex-col justify-between rounded-xs"
              onClick={() => onSelectProduct && onSelectProduct(leadProduct.id || leadProduct)}
            >
              <div className="flex items-center justify-between z-10">
                <span className="typography-eyebrow text-[9px] px-3 py-1 bg-[#0B0B0C] border border-[#B89A62]/40">
                  FLAGSHIP SILHOUETTE
                </span>
                <span className="text-[10px] tracking-widest text-[#B89A62] uppercase font-mono">
                  {leadProduct.gender || 'UNISEX'}
                </span>
              </div>

              {/* Large Centered Visual */}
              <div className="relative my-8 md:my-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-radial from-[#B89A62]/10 to-transparent blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <img
                  src={leadProduct.image || "/images/oud_wood.jpg"}
                  alt={leadProduct.name}
                  className="max-h-72 md:max-h-96 object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Dominant Info Block */}
              <div className="space-y-4 pt-6 border-t border-white/[0.08] relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <span className="typography-eyebrow text-[#A1A1AA] text-[10px]">
                      {leadProduct.brand} · EXTRAIT
                    </span>
                    <h3 className="typography-display text-[#F7F4EE] group-hover:text-[#B89A62] transition-colors">
                      {leadProduct.name}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] mt-1 font-light">
                      Inspired by <span className="text-[#E3DCD0]">{leadProduct.inspiredByName || leadProduct.brand}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] tracking-widest text-[#A1A1AA] block uppercase">
                      STARTING AT
                    </span>
                    <span className="font-editorial-serif text-2xl md:text-3xl font-light text-[#F7F4EE]">
                      ₹{(leadProduct.minPrice || (leadProduct.variants?.length ? Math.min(...leadProduct.variants.map(v => Number(v.price))) : (leadProduct.price || 999))).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-3 text-xs tracking-widest text-[#B89A62] uppercase font-medium">
                  <span>VIEW FULL COMPOSITION</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B89A62] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Right Companion Column */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-8">
              {companionProducts.slice(0, 2).map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

          </div>
        )}

        {/* LAYOUT 2: EDITORIAL BALANCED GRID */}
        {layout === 'GRID' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {items.slice(0, 4).map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

        {/* LAYOUT 3: HORIZONTAL SHOWCASE / CAROUSEL */}
        {layout === 'CAROUSEL' && (
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {items.slice(activeCarouselIndex, activeCarouselIndex + 3).map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

            {items.length > 3 && (
              <div className="flex items-center justify-center space-x-4 mt-12">
                <button
                  onClick={() => setActiveCarouselIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeCarouselIndex === 0}
                  className="p-3 bg-[#121214] border border-white/[0.1] hover:border-[#B89A62] text-[#F7F4EE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous Fragrance"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs tracking-widest text-[#A1A1AA] font-mono">
                  {activeCarouselIndex + 1} / {Math.max(1, items.length - 2)}
                </span>
                <button
                  onClick={() => setActiveCarouselIndex((prev) => Math.min(items.length - 3, prev + 1))}
                  disabled={activeCarouselIndex >= items.length - 3}
                  className="p-3 bg-[#121214] border border-white/[0.1] hover:border-[#B89A62] text-[#F7F4EE] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next Fragrance"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
