import React from 'react';
import { useCms } from '../context/CmsContext';

export default function EditorialIntroSection({ onDiscover }) {
  const { getSection } = useCms();
  const section = getSection('editorial_intro');

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'Perfume is memory.\nİLLURÊ makes it yours.';
  const subtitle = section?.subtitle || 'THE ESSENCE OF QUIET LUXURY';
  const description = section?.description || 'Crafted with uncompromising extrait-level concentration, each silhouette balances weight, intimacy, and presence.';
  const custom = section?.customData || {};
  const callout = custom.calloutNote || 'Hand-blended and matured for enduring projection and seamless day-to-night transitions.';

  return (
    <section 
      id="editorial-intro-section" 
      className="relative bg-[#0B0B0C] py-24 md:py-36 px-6 md:px-12 border-b border-white/[0.04] overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto">
        
        {/* Subtle background crest accent watermark */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none text-[#B89A62]">
          <span className="font-bodoni text-[20vw] leading-none">İ</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Oversized Editorial Statement */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[1px] bg-[#B89A62]" />
              <span className="typography-eyebrow">
                {subtitle}
              </span>
            </div>

            <h2 className="typography-display text-[#F7F4EE] whitespace-pre-line leading-[1.08]">
              {title}
            </h2>

            <div className="w-16 h-[1px] bg-[#B89A62]/30 mt-4" />
          </div>

          {/* Right: Small Explanatory Commentary & Whitespace */}
          <div className="lg:col-span-5 space-y-6 lg:pl-8">
            <p className="typography-body-large text-[#A1A1AA] font-light">
              {description}
            </p>

            <blockquote className="border-l-2 border-[#B89A62]/40 pl-4 py-1 text-xs md:text-sm text-[#F7F4EE]/90 italic font-editorial-serif">
              {callout}
            </blockquote>

            <div className="pt-2">
              <button
                onClick={onDiscover}
                className="group inline-flex items-center space-x-2 text-xs tracking-[0.25em] uppercase text-[#B89A62] hover:text-[#F7F4EE] transition-colors"
              >
                <span className="border-b border-[#B89A62]/40 group-hover:border-[#F7F4EE] pb-0.5">
                  OUR PHILOSOPHY & INGREDIENTS
                </span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

