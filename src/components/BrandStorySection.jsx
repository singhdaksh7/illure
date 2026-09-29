import React from 'react';
import { ArrowRight } from 'lucide-react';
import IllureCrest from './IllureCrest';

export default function BrandStorySection({ onDiscoverStory }) {
  return (
    <section className="py-24 md:py-36 bg-[#080C0D] relative select-none overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* EDITORIAL SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: LARGE ARTISTIC PERFUME PHOTOGRAPH WITH SUBTLE EMBLEM ACCENT */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[480px] sm:h-[580px] w-full rounded-xs overflow-hidden border border-white/[0.08]">
              <img 
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200" 
                alt="İLLURÊ FRAGRANCE Philosophy & Craftsmanship" 
                className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05] hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080C0D] via-transparent to-transparent opacity-60" />
            </div>

            {/* ARTISTIC FLOATING CARD BADGE WITH MINI CREST */}
            <div className="absolute -bottom-6 -right-2 sm:right-6 bg-[#101617]/95 backdrop-blur-md border border-white/[0.1] p-6 max-w-xs shadow-2xl space-y-2 flex flex-col items-start">
              <div className="flex items-center space-x-2">
                <IllureCrest className="w-6 h-6" color="#B89A62" variant="simplified" />
                <span className="font-interface-sans text-[9px] tracking-[0.3em] text-[#B89A62] uppercase block font-semibold">
                  CRAFTSMANSHIP
                </span>
              </div>
              <p className="font-editorial-serif text-lg text-[#F2EFE8]">
                Hand-selected rare extraits from historic ateliers.
              </p>
            </div>
          </div>

          {/* RIGHT: PHILOSOPHY CONTENT */}
          <div className="lg:col-span-6 space-y-8 lg:pl-6">
            
            {/* Small Label with Brand Crest */}
            <div className="flex items-center space-x-4">
              <IllureCrest className="w-10 h-10" color="#B89A62" variant="simplified" />
              <div className="flex items-center space-x-3">
                <span className="w-8 h-[1px] bg-[#B89A62]" />
                <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-medium">
                  İLLURÊ / OUR PHILOSOPHY
                </span>
              </div>
            </div>

            {/* Heading */}
            <h3 className="font-editorial-serif text-4xl sm:text-5xl lg:text-6xl text-[#F2EFE8] font-light leading-[1.08] tracking-tight">
              MORE THAN <br />
              <span className="italic font-normal text-[#B89A62]">A FRAGRANCE.</span>
            </h3>

            {/* Text Copy */}
            <div className="space-y-4 font-interface-sans text-sm md:text-base text-[#8F9897] font-light leading-relaxed">
              <p className="text-[#F2EFE8]/90 font-normal">
                The fragrance you choose becomes part of how the world remembers you.
              </p>
              <p>
                İLLURÊ FRAGRANCE brings together distinctive scents chosen for their craftsmanship, character and presence.
              </p>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button 
                onClick={onDiscoverStory}
                className="group relative inline-flex items-center space-x-4 px-7 py-3.5 bg-[#101617] border border-white/[0.12] hover:border-[#B89A62] text-[#F2EFE8] font-interface-sans text-[11px] tracking-[0.25em] uppercase transition-all duration-300 hover:bg-[#161C1D]"
              >
                <span>DISCOVER OUR STORY</span>
                <ArrowRight className="w-4 h-4 text-[#B89A62] group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
