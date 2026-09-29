import React, { useState, useEffect } from 'react';

export default function CinematicBrandMoment() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen w-full bg-[#080C0D] overflow-hidden flex items-center justify-center select-none py-24">
      
      {/* CINEMATIC PARALLAX BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out filter brightness-[0.4] contrast-[1.1] pointer-events-none scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1800')`,
          transform: `translateY(${scrollY * 0.12}px) scale(1.08)`,
        }}
      />

      {/* DARK GRADIENT OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080C0D] via-transparent to-[#080C0D] opacity-90 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />

      {/* CENTERED EDITORIAL STATEMENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-10">
        
        <div className="space-y-4">
          <span className="font-interface-sans text-[10px] tracking-[0.4em] text-[#B89A62] uppercase font-medium">
            EDITORIAL PARFUMERIE
          </span>

          <h2 className="font-editorial-serif text-5xl sm:text-7xl lg:text-8xl font-light text-[#F2EFE8] leading-[1.05] tracking-tight max-w-4xl mx-auto">
            FRAGRANCE IS <br />
            <span className="italic font-normal text-[#B89A62]">MEMORY MADE</span> <br />
            INVISIBLE.
          </h2>
        </div>

        {/* BRAND SIGNATURE BELOW */}
        <div className="pt-6 flex flex-col items-center space-y-2">
          <span className="w-12 h-[1px] bg-[#B89A62]" />
          <span className="font-bodoni text-3xl md:text-4xl text-[#F2EFE8] tracking-[0.35em] uppercase font-light">
            İLLURÊ
          </span>
          <span className="font-interface-sans text-[9px] tracking-[0.45em] text-[#B89A62] uppercase font-medium">
            FRAGRANCE · EST. 2026
          </span>
        </div>

      </div>

    </section>
  );
}
