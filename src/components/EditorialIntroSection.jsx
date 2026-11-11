import React from 'react';
import { useCms } from '../context/CmsContext';

export default function EditorialIntroSection({ onDiscover }) {
  const { getSection } = useCms();
  const section = getSection('editorial_intro');

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'Your scent should say something\nbefore you do.';
  const subtitle = section?.subtitle || 'THE İLLURÊ POINT OF VIEW';
  const description = section?.description || 'Familiar inspiration. A different identity. Thoughtfully balanced so your scent holds its ground without shouting.';
  const custom = section?.customData || {};
  const callout = custom.calloutNote || 'Good fragrance doesn’t need a long explanation.';

  return (
    <section 
      id="editorial-intro-section" 
      className="relative bg-[#0E1011] py-28 md:py-36 px-6 md:px-12 border-b border-[#D8BE82]/15 overflow-hidden"
    >
      {/* Subtle warm glow floor */}
      <div 
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-[#C7A866]/[0.035] rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* Subtle background crest accent watermark */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.035] select-none text-[#C7A866]">
          <span className="font-bodoni text-[20vw] leading-none">İ</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Oversized Editorial Statement */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[1px] bg-[#C7A866]" />
              <span className="typography-eyebrow">
                {subtitle}
              </span>
            </div>

            <h2 className="typography-display text-[#F7F3EA] whitespace-pre-line leading-[1.08]">
              {title}
            </h2>

            <div className="w-20 h-[1px] bg-[#C7A866]/40 mt-4" />
          </div>

          {/* Right: Small Explanatory Commentary & Whitespace */}
          <div className="lg:col-span-5 space-y-6 lg:pl-8">
            <p className="typography-body-large text-[#D8D0C3] font-light max-w-[560px]">
              {description}
            </p>

            <blockquote className="border-l-2 border-[#C7A866]/50 pl-4 py-1 text-sm md:text-base text-[#F7F3EA] italic font-editorial-serif">
              {callout}
            </blockquote>

            <div className="pt-2">
              <button
                onClick={onDiscover}
                className="group inline-flex items-center space-x-2 text-xs tracking-[0.25em] uppercase text-[#D8BE82] hover:text-[#F7F3EA] transition-colors"
              >
                <span className="border-b border-[#C7A866]/50 group-hover:border-[#F7F3EA] pb-0.5">
                  EXPLORE THE LINEUP
                </span>
                <span className="group-hover:translate-x-1.5 transition-transform">→</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

