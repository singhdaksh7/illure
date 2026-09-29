import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BRANDS } from '../data/products';

export default function BrandDiscovery({ onSelectBrand, onViewAllBrands }) {
  return (
    <section className="py-24 bg-[#0C1113] border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 space-y-4 sm:space-y-0">
          <div>
            <span className="font-sans-clean text-xs font-semibold tracking-[0.3em] text-[#D4AF37] uppercase block mb-1">
              THE HOUSES OF PARFUMERIE
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#F4F1EA] font-light">
              EXPLORE BY HOUSE
            </h2>
          </div>

          <button 
            onClick={onViewAllBrands}
            className="flex items-center space-x-2 text-xs font-sans-clean font-semibold tracking-[0.25em] text-[#D4AF37] hover:text-[#E6C687] transition-colors uppercase group"
          >
            <span>VIEW ALL HOUSES</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Minimal Monochrome Brand Houses Grid / Horizontal Showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BRANDS.map((brand) => (
            <div
              key={brand.id}
              onClick={() => onSelectBrand(brand.id)}
              className="group relative p-8 bg-[#080B0D] border border-white/5 hover:border-[#D4AF37]/40 rounded-xs flex flex-col justify-between h-48 cursor-pointer transition-all duration-500 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Subtle background image reveal on hover */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundImage: `url(${brand.heroImage})` }}
              />

              <div className="z-10 flex items-center justify-between">
                <span className="font-sans-clean text-[10px] tracking-[0.2em] text-[#636058] group-hover:text-[#D4AF37] transition-colors uppercase">
                  EST. {brand.founded}
                </span>
                <span className="font-sans-clean text-[10px] tracking-[0.15em] text-[#A39E93]">
                  {brand.origin}
                </span>
              </div>

              <div className="z-10 mt-auto">
                <h3 className="font-cinzel text-lg sm:text-xl font-semibold tracking-[0.2em] text-[#F4F1EA] group-hover:text-gold-gradient transition-all">
                  {brand.name.toUpperCase()}
                </h3>
                <p className="font-sans-clean text-[11px] text-[#A39E93] line-clamp-1 mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {brand.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
