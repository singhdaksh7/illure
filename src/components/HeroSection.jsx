import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection({ onExplore, onProductSelect }) {
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
      // Restrained, subtle cursor damping for high-end luxury feel
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 18,
        y: (e.clientY / innerHeight - 0.5) * 18,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="relative min-h-screen h-[100vh] w-full bg-[#080C0D] overflow-hidden flex flex-col justify-between pt-28 pb-10 select-none">
      
      {/* 1. LAYER 0 — FULL-BLEED COSMIC & ATMOSPHERIC HERO BANNER BACKGROUND */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
        
        {/* Full-screen Obsidian Base */}
        <div className="absolute inset-0 bg-[#080C0D]" />

        {/* Dynamic Full-Width Cosmic Nebula Radial Gradient Canvas */}
        <div 
          className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out"
          style={{
            background: `
              radial-gradient(ellipse 90% 70% at ${50 + mousePos.x * 0.15}% ${50 + mousePos.y * 0.15}%, rgba(198, 174, 130, 0.1) 0%, rgba(35, 45, 55, 0.14) 35%, rgba(14, 19, 20, 0.8) 70%, rgba(8, 12, 13, 0.99) 100%),
              radial-gradient(ellipse 120% 50% at 50% 50%, rgba(180, 140, 80, 0.06) 0%, rgba(15, 25, 35, 0.08) 50%, transparent 100%)
            `,
          }}
        />

        {/* Full-Bleed Horizontal Atmospheric Glow Beam (Campaign Banner Feel) */}
        <div 
          className="absolute top-1/2 left-0 w-full h-[60vh] -translate-y-1/2 pointer-events-none opacity-80"
          style={{
            background: `radial-gradient(ellipse 100% 45% at 50% 50%, rgba(198, 174, 130, 0.09) 0%, rgba(40, 55, 65, 0.05) 50%, transparent 85%)`,
          }}
        />

        {/* Wide Champagne Ambient Cosmic Halo (Centered behind bottle, expanding full width) */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[80vh] max-w-[1400px] max-h-[1100px] bg-[#C6AE82]/[0.05] rounded-full blur-[160px]"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePos.x * -0.2}px, ${mousePos.y * -0.2}px)`,
          }}
        />

        {/* Central Bottle Backlight Aura */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] bg-[#DFCDA4]/[0.045] rounded-full blur-[100px]"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePos.x * 0.15}px, ${mousePos.y * 0.15}px)`,
          }}
        />

        {/* FULL-BLEED COSMIC STARFIELD LAYER (Spans Left 0% to Right 100%) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {[
            { top: '12%', left: '8%', size: '2px', opacity: 0.75, delay: '0s' },
            { top: '22%', left: '18%', size: '1.5px', opacity: 0.5, delay: '1s' },
            { top: '15%', left: '32%', size: '2px', opacity: 0.9, delay: '2s' },
            { top: '38%', left: '12%', size: '1px', opacity: 0.4, delay: '0.5s' },
            { top: '65%', left: '7%', size: '2.5px', opacity: 0.8, delay: '1.5s' },
            { top: '80%', left: '15%', size: '1.5px', opacity: 0.6, delay: '2.5s' },
            { top: '10%', left: '72%', size: '2px', opacity: 0.85, delay: '0.8s' },
            { top: '28%', left: '85%', size: '2.5px', opacity: 0.7, delay: '1.8s' },
            { top: '45%', left: '92%', size: '1px', opacity: 0.5, delay: '0.2s' },
            { top: '70%', left: '88%', size: '2px', opacity: 0.9, delay: '2.2s' },
            { top: '85%', left: '78%', size: '1.5px', opacity: 0.6, delay: '1.2s' },
            { top: '18%', left: '50%', size: '2px', opacity: 0.65, delay: '3s' },
            { top: '75%', left: '48%', size: '1.5px', opacity: 0.55, delay: '0.4s' },
            { top: '30%', left: '25%', size: '1px', opacity: 0.45, delay: '1.7s' },
            { top: '60%', left: '75%', size: '1.5px', opacity: 0.5, delay: '2.7s' },
            { top: '42%', left: '6%', size: '2px', opacity: 0.7, delay: '0.9s' },
            { top: '52%', left: '94%', size: '2px', opacity: 0.75, delay: '1.9s' },
          ].map((star, idx) => (
            <div
              key={idx}
              className="absolute rounded-full bg-[#F4F1EA] animate-pulse"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animationDuration: `${3 + (idx % 3)}s`,
                animationDelay: star.delay,
                boxShadow: star.opacity > 0.7 ? '0 0 6px 1px rgba(244, 241, 234, 0.6)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Full Viewport Vignette Edge Shadow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#080C0D_95%)] opacity-90" />

        {/* Subtle Luxury Film Grain Overlay */}
        <div className="absolute inset-0 bg-noise opacity-20" />

      </div>

      {/* 3. LAYER 2 — GIANT FADED "İLLURÊ" TYPOGRAPHY LAYER */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10"
        style={{
          transform: `translateY(${scrollY * 0.25}px)`,
          opacity: Math.max(0, 1 - scrollY * 0.0012),
        }}
      >
        <h1 
          className={`font-bodoni text-[28vw] sm:text-[27vw] lg:text-[29vw] xl:text-[30vw] font-light text-[#F2EFE8]/[0.035] tracking-[0.14em] leading-none uppercase transition-all duration-1000 ease-out select-none ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)`,
            textShadow: '0 0 120px rgba(0,0,0,0.98)',
          }}
        >
          İLLURÊ
        </h1>
      </div>

      {/* 4. LAYER 3 — FLOATING PERFUME BOTTLE CENTERPIECE (NO BOXED IMAGE FRAME) */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div 
          className={`relative transition-all duration-1000 ease-out cursor-pointer pointer-events-auto ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{
            transform: `translateY(${scrollY * -0.1 + mousePos.y * 0.45}px) translateX(${mousePos.x * 0.45}px) rotate(${mousePos.x * 0.03}deg)`,
          }}
          onClick={() => onProductSelect && onProductSelect('tf-oud-wood')}
        >
          {/* Restrained Bottle Floor Drop Shadow */}
          <div className="absolute bottom-[-35px] left-1/2 -translate-x-1/2 w-64 h-10 bg-[#000000]/95 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-40 h-6 bg-[#B89A62]/[0.08] rounded-full blur-lg pointer-events-none" />

          {/* Floating Perfume Bottle - Screen blended & radially masked so background flows edge-to-edge */}
          <div className="relative group w-[270px] sm:w-[350px] md:w-[430px] lg:w-[470px] xl:w-[500px] transition-transform duration-700">
            <img 
              src="/images/hero.jpg" 
              alt="İLLURÊ FRAGRANCE Signature Bottle" 
              className="w-full h-auto object-contain filter brightness-[1.08] contrast-[1.08] animate-float"
              style={{
                mixBlendMode: 'screen',
                WebkitMaskImage: 'radial-gradient(ellipse 68% 75% at 50% 50%, black 40%, rgba(0,0,0,0.85) 65%, transparent 95%)',
                maskImage: 'radial-gradient(ellipse 68% 75% at 50% 50%, black 40%, rgba(0,0,0,0.85) 65%, transparent 95%)',
              }}
            />

            {/* Subtle Interactive Label Tag on Hover */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#101617]/95 backdrop-blur-md border border-[#B89A62]/25 px-5 py-2.5 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-center whitespace-nowrap shadow-2xl">
              <span className="font-interface-sans text-[9px] tracking-[0.28em] text-[#B89A62] uppercase block font-semibold">
                EXPLORE SIGNATURE
              </span>
              <span className="font-editorial-serif text-sm text-[#F2EFE8]">
                Tom Ford Oud Wood · Eau de Parfum
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. LAYER 4 — SPARSE EDITORIAL COPY & OVERLAY CTAs */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full h-full flex flex-col justify-between relative z-30 pointer-events-none">
        
        {/* Top Spacer */}
        <div className="h-12 md:h-20" />

        {/* Bottom Editorial Layout */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-end transition-all duration-1000 delay-300 pb-2 md:pb-6 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            transform: `translateY(${scrollY * -0.03}px)`,
          }}
        >
          {/* Bottom Left: Headline, Subtext & CTA */}
          <div className="md:col-span-7 lg:col-span-6 space-y-6 pointer-events-auto">
            
            {/* Small Establishment Label */}
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[1px] bg-[#B89A62]" />
              <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-medium">
                HAUTE PARFUMERIE · EST. 2026
              </span>
            </div>

            {/* Main Editorial Headline */}
            <h2 className="font-editorial-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-[#F2EFE8] leading-[1.04] tracking-tight">
              A NEW LANGUAGE <br />
              <span className="italic font-normal text-[#B89A62]">OF FRAGRANCE</span>
            </h2>

            {/* Subtext */}
            <p className="font-interface-sans text-xs sm:text-sm text-[#8F9897] max-w-md leading-relaxed tracking-wide font-light">
              Distinctive fragrances, curated for those who leave an impression.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <button 
                onClick={onExplore}
                className="group relative inline-flex items-center space-x-4 px-8 py-4 bg-[#101617]/90 backdrop-blur-md border border-white/[0.14] hover:border-[#B89A62] text-[#F2EFE8] font-interface-sans text-[11px] tracking-[0.28em] uppercase transition-all duration-300 hover:bg-[#161C1D] shadow-2xl"
              >
                <span>DISCOVER İLLURÊ</span>
                <ArrowRight className="w-4 h-4 text-[#B89A62] group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Bottom Right: Tagline & Scroll Indicator */}
          <div className="md:col-span-5 lg:col-span-6 flex flex-col md:items-end justify-between space-y-5 md:space-y-0 text-left md:text-right pointer-events-auto">
            
            <div className="space-y-1">
              <p className="font-editorial-serif text-xl sm:text-2xl text-[#F2EFE8]/85 italic">
                “Leave an impression.”
              </p>
              <p className="font-interface-sans text-[9px] tracking-[0.3em] text-[#8F9897] uppercase">
                İLLURÊ PARFUMERIE
              </p>
            </div>

            {/* Scroll Indicator */}
            <div 
              onClick={onExplore}
              className="cursor-pointer group flex items-center space-x-3 text-[10px] tracking-[0.25em] text-[#8F9897] hover:text-[#F2EFE8] transition-colors pt-4 md:pt-0"
            >
              <span className="uppercase">SCROLL TO EXPLORE</span>
              <div className="w-4 h-8 border border-white/[0.18] group-hover:border-[#B89A62] rounded-full flex justify-center p-1 transition-colors">
                <div className="w-1 h-2 bg-[#B89A62] rounded-full animate-bounce" />
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

