import React, { useState, useEffect } from 'react';
import IllureCrest from './IllureCrest';
import { useCms } from '../context/CmsContext';

export default function CinematicBrandMoment() {
  const { getSection } = useCms();
  const section = getSection('cinematic_moment');

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'TIME SUSPENDED IN LIQUID GOLD';
  const subtitle = section?.subtitle || 'THE ESSENCE';
  const image = section?.desktopImage || 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=1920';

  return (
    <section className="relative min-h-[90vh] md:min-h-screen w-full bg-[#0B0B0C] overflow-hidden flex items-center justify-center select-none py-28 border-b border-white/[0.04]">
      
      {/* Background with Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-200 ease-out filter brightness-[0.38] contrast-[1.15] pointer-events-none scale-105"
        style={{
          backgroundImage: `url('${image}')`,
          transform: `translateY(${scrollY * 0.08}px) scale(1.06)`,
        }}
      />

      {/* Ambiance Radial Gold & Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-[#0B0B0C] opacity-95 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] bg-[#B89A62]/[0.05] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      {/* Minimal Editorial Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-10">
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <span className="w-8 h-[1px] bg-[#B89A62]" />
            <span className="typography-eyebrow">
              {subtitle}
            </span>
            <span className="w-8 h-[1px] bg-[#B89A62]" />
          </div>

          <h2 className="typography-display-xl text-[#F7F4EE] max-w-4xl mx-auto">
            A FRAGRANCE DOES NOT SIMPLY ACCOMPANY. <br />
            <span className="italic font-light text-[#B89A62]">IT ANNOUNCES & LINGERS.</span>
          </h2>
        </div>

        {/* Brand Crest Seal */}
        <div className="pt-6 flex flex-col items-center space-y-3">
          <IllureCrest size={40} className="text-[#B89A62] opacity-90 animate-pulse" />
          <span className="font-bodoni text-2xl md:text-3xl text-[#F7F4EE] tracking-[0.35em] uppercase font-light">
            İLLURÊ
          </span>
          <span className="typography-eyebrow text-[9px] text-[#A1A1AA]">
            HAUTE PARFUMERIE · PARIS & NEW DELHI
          </span>
        </div>

      </div>

    </section>
  );
}
