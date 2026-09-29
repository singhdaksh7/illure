import React from 'react';

const BRAND_HOUSES = [
  "TOM FORD",
  "DIOR",
  "CREED",
  "CHANEL",
  "YVES SAINT LAURENT",
  "GIORGIO ARMANI",
  "VERSACE",
  "JEAN PAUL GAULTIER"
];

export default function BrandsMarqueeSection() {
  return (
    <section className="py-20 bg-[#080C0D] border-y border-white/[0.05] overflow-hidden select-none">
      
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <span className="font-interface-sans text-[10px] tracking-[0.35em] text-[#8F9897] uppercase font-medium">
          THE HOUSES WE ADMIRE
        </span>
      </div>

      {/* INFINITE MONOCHROME SUBTLE MARQUEE */}
      <div className="relative w-full overflow-hidden flex items-center">
        
        {/* Gradient Fade Edges */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#080C0D] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#080C0D] to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee flex items-center space-x-16 md:space-x-24 text-[#8F9897]/50 whitespace-nowrap">
          {/* Double array for seamless looping */}
          {[...BRAND_HOUSES, ...BRAND_HOUSES].map((brand, idx) => (
            <span 
              key={idx}
              className="font-editorial-serif text-2xl md:text-3xl tracking-[0.25em] font-light hover:text-[#F2EFE8] transition-colors duration-300 cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>

      </div>

    </section>
  );
}
