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

  // Content extraction with graceful brand fallbacks
  const eyebrow = (heroConfig?.subtitle && heroConfig.subtitle.trim()) || 'İLLURÊ FRAGRANCE';
  const heading = (heroConfig?.title && heroConfig.title.trim()) || 'WEAR SOMETHING\nTHEY REMEMBER.';
  const bodyText = (heroConfig?.description && heroConfig.description.trim()) || 'Inspired fragrance. Made the İLLURÊ way.';
  const primaryCta = (heroConfig?.ctaLabel && heroConfig.ctaLabel.trim()) || 'SHOP FRAGRANCES';
  const primaryUrl = (heroConfig?.ctaUrl && heroConfig.ctaUrl.trim()) || '#curated-section';
  const custom = heroConfig?.customData || {};
  const secondaryCta = (custom.secondaryCtaLabel && custom.secondaryCtaLabel.trim()) || 'OUR STORY';
  const bottleImg = (custom.bottleImage && custom.bottleImage.trim()) || '/images/hero.jpg';
  const overlayStrength = typeof custom.overlayStrength === 'number' ? Math.max(0.1, Math.min(0.95, custom.overlayStrength)) : 0.7;

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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[660px] h-[660px] rounded-full pointer-events-none transition-all duration-700 ease-out blur-3xl opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(199, 168, 102, 0.18) 0%, rgba(199, 168, 102, 0.05) 45%, transparent 75%)',
            transform: `translate(-50%, -50%) translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
          }}
        />

        {/* Subtle Film Grain Noise Texture */}
        <div 
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Cinematic Vignette */}
        <div 
          className="absolute inset-0 bg-radial from-transparent via-transparent to-[#0B0B0C] pointer-events-none"
          style={{ opacity: overlayStrength }}
        />
        
        {/* Top & Bottom Obsidian Fade Hairlines */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0B0B0C] to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/80 to-transparent pointer-events-none" />
      </div>

      {/* 2. LAYER 1 — GIANT FAINT 'İLLURÊ' BACKGROUND TYPOGRAPHY (ROMAN WATERMARK) */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden"
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
              onError={(e) => {
                e.currentTarget.src = '/images/hero_bottle_clean.png';
              }}
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
                Royal Oud Wood · 50 ML Flacon
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
            <h2 className="typography-display-xl text-[#F7F3EA] whitespace-pre-line">
              {heading.includes('\n') ? (
                <>
                  <span>{heading.split('\n')[0]}</span>
                  <br />
                  <span className="text-[#D8BE82] font-medium">{heading.split('\n').slice(1).join('\n')}</span>
                </>
              ) : (
                heading
              )}
            </h2>

            {/* Body Description */}
            <p className="typography-body-large text-[#D8D0C3] max-w-md">
              {bodyText}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button 
                onClick={handlePrimaryClick}
                className="btn-primary-gold"
              >
                <span>{primaryCta}</span>
                <ArrowRight className="w-4 h-4 text-[#080A0B] group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>

              <button 
                onClick={handleSecondaryClick}
                className="btn-secondary-ivory"
              >
                <span>{secondaryCta}</span>
              </button>
            </div>
          </div>

          {/* Bottom Right: Micro Details & Scroll Pill */}
          <div className="md:col-span-5 lg:col-span-6 flex flex-col md:items-end justify-between space-y-8 pointer-events-auto">
            
            {/* Minimal formulation note */}
            <div className="hidden lg:block text-right space-y-1.5">
              <span className="typography-eyebrow text-[9px] text-[#B89A62]">
                CONCENTRATED EXTRAIT
              </span>
              <p className="font-editorial-serif text-sm text-[#F7F4EE] italic">
                {custom.formulationNote || 'High-character formulation · Made to be worn'}
              </p>
            </div>

            {/* Vertical Scroll Indicator */}
            <button 
              onClick={handlePrimaryClick}
              className="group flex items-center space-x-3 text-[#A1A1AA] hover:text-[#F7F4EE] transition-colors focus:outline-none"
              aria-label="Scroll to collection"
            >
              <div className="w-5 h-8 border border-white/20 group-hover:border-[#B89A62] rounded-full flex items-start justify-center p-1 transition-colors">
                <div className="w-1 h-2 bg-[#B89A62] rounded-full animate-bounce mt-0.5" />
              </div>
              <span className="font-interface-sans text-[9px] tracking-[0.3em] uppercase">
                SCROLL
              </span>
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}
