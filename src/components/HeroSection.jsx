import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export default function HeroSection({ onExplore, onProductSelect }) {
  const { getSection } = useCms();
  const heroConfig = getSection('hero');

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 16,
        y: (e.clientY / innerHeight - 0.5) * 16,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (heroConfig && !heroConfig.isEnabled) {
    return null;
  }

  // Content extraction with graceful luxury fallbacks
  const eyebrow = heroConfig?.subtitle || 'THE HOUSE OF İLLURÊ';
  const heading = heroConfig?.title || 'Fragrance,\nReimagined.';
  const bodyText = heroConfig?.description || 'Distinctive scent profiles inspired by icons, finished in the language of İLLURÊ.';
  const primaryCta = heroConfig?.ctaLabel || 'EXPLORE THE COLLECTION';
  const primaryUrl = heroConfig?.ctaUrl || '#catalog';
  const custom = heroConfig?.customData || {};
  const secondaryCta = custom.secondaryCtaLabel || 'DISCOVER İLLURÊ';
  const bottleImg = custom.bottleImage || '/images/hero.jpg';
  const overlayStrength = custom.overlayStrength !== undefined ? custom.overlayStrength : 0.7;

  const handlePrimaryClick = () => {
    if (primaryUrl === '#catalog' || primaryUrl === '#curated-section') {
      if (onExplore) onExplore();
      else {
        const el = document.getElementById('curated-section') || document.getElementById('catalog');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (primaryUrl.startsWith('#')) {
      const el = document.querySelector(primaryUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = primaryUrl;
    }
  };

  const handleSecondaryClick = () => {
    const el = document.getElementById('brand-story-section') || document.getElementById('editorial-intro-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else if (onExplore) onExplore();
  };

  return (
    <section className="relative min-h-screen h-[100vh] w-full bg-[#0B0B0C] overflow-hidden flex flex-col justify-between pt-24 pb-8 select-none">
      
      {/* 1. LAYER 0 — FULL-BLEED COSMIC & ATMOSPHERIC HERO BANNER BACKGROUND */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        
        {/* Full-screen Obsidian Base */}
        <div className="absolute inset-0 bg-[#0B0B0C]" />

        {/* Dynamic Nebula Radial Gradient Canvas */}
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at ${50 + mousePos.x * 0.15}% ${50 + mousePos.y * 0.15}%, rgba(184, 154, 98, 0.12) 0%, rgba(24, 24, 27, 0.4) 35%, rgba(18, 18, 20, 0.85) 70%, rgba(11, 11, 12, 0.99) 100%),
              radial-gradient(ellipse 120% 50% at 50% 50%, rgba(169, 139, 85, 0.08) 0%, rgba(15, 15, 18, 0.3) 50%, transparent 100%)
            `,
          }}
        />

        {/* Horizontal Gold Ambient Ray */}
        <div 
          className="absolute top-1/2 left-0 w-full h-[60vh] -translate-y-1/2 pointer-events-none opacity-70"
          style={{
            background: `radial-gradient(ellipse 100% 45% at 50% 50%, rgba(184, 154, 98, 0.09) 0%, rgba(30, 30, 35, 0.05) 50%, transparent 85%)`,
          }}
        />

        {/* Ambient Halo Behind Bottle */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] h-[75vh] max-w-[1300px] max-h-[1000px] bg-[#B89A62]/[0.05] rounded-full blur-[150px]"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)`,
          }}
        />

        {/* Starfield Particles */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {[
            { top: '14%', left: '10%', size: '2px', opacity: 0.65, delay: '0s' },
            { top: '24%', left: '16%', size: '1.5px', opacity: 0.45, delay: '1s' },
            { top: '18%', left: '34%', size: '2px', opacity: 0.8, delay: '2s' },
            { top: '40%', left: '14%', size: '1px', opacity: 0.35, delay: '0.5s' },
            { top: '68%', left: '9%', size: '2.5px', opacity: 0.7, delay: '1.5s' },
            { top: '82%', left: '18%', size: '1.5px', opacity: 0.5, delay: '2.5s' },
            { top: '12%', left: '74%', size: '2px', opacity: 0.75, delay: '0.8s' },
            { top: '30%', left: '84%', size: '2.5px', opacity: 0.65, delay: '1.8s' },
            { top: '72%', left: '86%', size: '2px', opacity: 0.8, delay: '2.2s' },
            { top: '84%', left: '76%', size: '1.5px', opacity: 0.55, delay: '1.2s' },
          ].map((star, idx) => (
            <div
              key={idx}
              className="absolute rounded-full bg-[#F7F4EE] animate-pulse"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animationDuration: `${3 + (idx % 3)}s`,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>

        {/* Controlled Vignette */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#0B0B0C_95%)]"
          style={{ opacity: overlayStrength }}
        />

        {/* Subtle Film Grain */}
        <div className="absolute inset-0 bg-noise opacity-15" />
      </div>

      {/* 2. LAYER 1 — GIANT FAINT İLLURÊ EDITORIAL TYPOGRAPHY */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10"
        style={{
          transform: `translateY(${scrollY * 0.22}px)`,
          opacity: Math.max(0, 1 - scrollY * 0.0014),
        }}
      >
        <h1 
          className={`font-bodoni text-[28vw] sm:text-[27vw] lg:text-[29vw] xl:text-[30vw] font-light text-[#F7F4EE]/[0.032] tracking-[0.14em] leading-none uppercase transition-all duration-1000 ease-out select-none ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            transform: `translate(${mousePos.x * 0.18}px, ${mousePos.y * 0.18}px)`,
            textShadow: '0 0 100px rgba(0,0,0,0.95)',
          }}
        >
          İLLURÊ
        </h1>
      </div>

      {/* 3. LAYER 2 — FLOATING PERFUME BOTTLE CENTERPIECE */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div 
          className={`relative transition-all duration-1000 ease-out cursor-pointer pointer-events-auto ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{
            transform: `translateY(${scrollY * -0.08 + mousePos.y * 0.35}px) translateX(${mousePos.x * 0.35}px) rotate(${mousePos.x * 0.02}deg)`,
          }}
          onClick={() => onProductSelect && onProductSelect('tf-oud-wood')}
        >
          {/* Subtle Bottle Floor Drop Shadow */}
          <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-64 h-9 bg-[#000000]/95 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-36 h-5 bg-[#B89A62]/[0.08] rounded-full blur-md pointer-events-none" />

          {/* Floating Perfume Bottle */}
          <div className="relative group w-[260px] sm:w-[330px] md:w-[410px] lg:w-[450px] xl:w-[480px] transition-transform duration-700">
            <img 
              src={bottleImg} 
              alt="İLLURÊ Signature Bottle" 
              className="w-full h-auto object-contain filter brightness-[1.06] contrast-[1.06] animate-float drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]"
              style={{
                mixBlendMode: 'screen',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 78% at 50% 50%, black 42%, rgba(0,0,0,0.85) 68%, transparent 96%)',
                maskImage: 'radial-gradient(ellipse 70% 78% at 50% 50%, black 42%, rgba(0,0,0,0.85) 68%, transparent 96%)',
              }}
            />

            {/* Hover Badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#121214]/95 backdrop-blur-md border border-[#B89A62]/30 px-5 py-2.5 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-center whitespace-nowrap shadow-2xl">
              <span className="font-interface-sans text-[9px] tracking-[0.28em] text-[#B89A62] uppercase block font-semibold">
                EXTRAIT DE PARFUM
              </span>
              <span className="font-editorial-serif text-sm text-[#F7F4EE]">
                Royal Oud Wood · Masterpiece Flacon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LAYER 3 — EDITORIAL COPY & CALLS TO ACTION */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full h-full flex flex-col justify-between relative z-30 pointer-events-none">
        
        {/* Top Spacer */}
        <div className="h-10 md:h-16" />

        {/* Bottom Editorial Composition */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-end transition-all duration-1000 delay-300 pb-4 md:pb-8 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            transform: `translateY(${scrollY * -0.03}px)`,
          }}
        >
          {/* Bottom Left: Eyebrow, Editorial Headline & Primary CTA */}
          <div className="md:col-span-7 lg:col-span-6 space-y-6 pointer-events-auto">
            
            {/* Eyebrow */}
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[1px] bg-[#B89A62]" />
              <span className="typography-eyebrow">
                {eyebrow}
              </span>
            </div>

            {/* Editorial Headline */}
            <h2 className="typography-display-xl text-[#F7F4EE] whitespace-pre-line">
              {heading}
            </h2>

            {/* Body Description */}
            <p className="typography-body-large max-w-md">
              {bodyText}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button 
                onClick={handlePrimaryClick}
                className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-[#B89A62] text-[#0B0B0C] font-interface-sans text-[11px] tracking-[0.28em] uppercase font-semibold transition-all duration-300 hover:bg-[#C0A46D] shadow-[0_10px_30px_rgba(184,154,98,0.2)]"
              >
                <span>{primaryCta}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0B0B0C] group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              <button 
                onClick={handleSecondaryClick}
                className="group inline-flex items-center space-x-2 px-6 py-4 bg-[#121214]/80 backdrop-blur-md border border-white/[0.12] hover:border-[#B89A62] text-[#F7F4EE] font-interface-sans text-[11px] tracking-[0.25em] uppercase font-medium transition-all duration-300"
              >
                <span>{secondaryCta}</span>
              </button>
            </div>
          </div>

          {/* Bottom Right: Editorial Tagline & Scroll Indicator */}
          <div className="md:col-span-5 lg:col-span-6 flex flex-col md:items-end justify-between space-y-5 md:space-y-0 text-left md:text-right pointer-events-auto">
            
            <div className="space-y-1">
              <p className="font-editorial-serif text-2xl sm:text-3xl text-[#F7F4EE]/90 italic">
                “Perfume is memory.”
              </p>
              <p className="typography-eyebrow text-[9px] text-[#A1A1AA]">
                İLLURÊ PARFUMERIE · PARIS & NEW DELHI
              </p>
            </div>

            {/* Scroll Indicator */}
            <div 
              onClick={handlePrimaryClick}
              className="cursor-pointer group flex items-center space-x-3 text-[10px] tracking-[0.25em] text-[#A1A1AA] hover:text-[#F7F4EE] transition-colors pt-6 md:pt-4"
            >
              <span className="uppercase font-interface-sans tracking-[0.28em]">SCROLL TO EXPLORE</span>
              <div className="w-4 h-7 border border-[#B89A62]/40 group-hover:border-[#B89A62] rounded-full flex justify-center p-1 transition-colors">
                <div className="w-1 h-1.5 bg-[#B89A62] rounded-full animate-bounce" />
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
