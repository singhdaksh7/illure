import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function NewArrivalSection({ onSelectProduct }) {
  return (
    <section className="py-24 md:py-36 bg-[#080C0D] relative select-none overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#B89A62]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* DOMINANT EDITORIAL SECTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: HUGE PRODUCT PHOTOGRAPHY */}
          <div 
            className="lg:col-span-7 relative group cursor-pointer"
            onClick={() => onSelectProduct && onSelectProduct('tf-oud-wood')}
          >
            <div className="relative h-[500px] sm:h-[650px] w-full rounded-xs overflow-hidden border border-white/[0.08] bg-[#101617] flex items-center justify-center p-8">
              
              {/* Radial Light */}
              <div className="absolute inset-0 bg-radial from-[#B89A62]/10 via-transparent to-transparent opacity-60" />

              <img 
                src="/images/oud_wood.jpg" 
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200"; }}
                alt="Tom Ford Oud Wood - Feature Release" 
                className="max-h-full w-auto object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Editorial Tag */}
              <div className="absolute top-8 left-8 flex items-center space-x-2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#B89A62]" />
                <span className="font-interface-sans text-[9px] tracking-[0.3em] text-[#F2EFE8] uppercase">
                  MASTERPIECE EDITION
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: EDITORIAL PRODUCT SPECS */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Small Label */}
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[1px] bg-[#B89A62]" />
              <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-medium">
                NEW TO İLLURÊ
              </span>
            </div>

            {/* Brand & Title */}
            <div className="space-y-2">
              <span className="font-interface-sans text-xs tracking-[0.35em] text-[#8F9897] uppercase font-medium block">
                TOM FORD
              </span>
              
              <h3 className="font-editorial-serif text-5xl sm:text-6xl text-[#F2EFE8] font-light leading-none tracking-tight">
                OUD WOOD
              </h3>
            </div>

            {/* Description */}
            <p className="font-interface-sans text-sm text-[#8F9897] font-light leading-relaxed max-w-md">
              A composition of exotic woods, smoky oud, sandalwood and warm amber.
            </p>

            {/* Specs & Pricing */}
            <div className="pt-4 space-y-4 border-t border-b border-white/[0.08] py-6">
              <div className="flex items-center justify-between text-xs tracking-widest font-interface-sans text-[#8F9897]">
                <span>AVAILABLE SIZES</span>
                <span className="text-[#F2EFE8] font-medium">50ML / 100ML</span>
              </div>

              <div className="flex items-center justify-between text-sm tracking-widest font-interface-sans text-[#8F9897]">
                <span>PRICE</span>
                <span className="font-editorial-serif text-2xl text-[#F2EFE8] font-normal">₹21,500</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button 
                onClick={() => onSelectProduct && onSelectProduct('tf-oud-wood')}
                className="group w-full sm:w-auto inline-flex items-center justify-center space-x-4 px-8 py-4 bg-[#101617] border border-white/[0.12] hover:border-[#B89A62] text-[#F2EFE8] font-interface-sans text-[11px] tracking-[0.25em] uppercase transition-all duration-300 hover:bg-[#161C1D]"
              >
                <span>DISCOVER FRAGRANCE</span>
                <ArrowRight className="w-4 h-4 text-[#B89A62] group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
