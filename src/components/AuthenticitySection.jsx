import React from 'react';
import IllureCrest from './IllureCrest';
import { useCms } from '../context/CmsContext';

const DEFAULT_PILLARS = [
  {
    number: "01",
    title: "YOUR SIZE",
    description: "Choose what works for you. From pocket-friendly flacons to full bottles."
  },
  {
    number: "02",
    title: "YOUR SCENT",
    description: "Inspired fragrance profiles with an İLLURÊ identity. Straightforward character."
  },
  {
    number: "03",
    title: "YOUR WAY",
    description: "Wear it wherever you want. You don’t need a black-tie invitation."
  },
  {
    number: "04",
    title: "PACKED PROPERLY",
    description: "Designed to feel good in the hand before you even spray it."
  }
];

export default function AuthenticitySection() {
  const { getSection } = useCms();
  const section = getSection('authenticity');

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'WHY İLLURÊ';
  const subtitle = section?.subtitle || 'THE FOUR PRINCIPLES';
  const custom = section?.customData || {};
  const pillars = custom.pillars || DEFAULT_PILLARS;

  return (
    <section 
      id="authenticity-section" 
      className="py-24 md:py-36 bg-[#0B0B0C] border-b border-white/[0.04] relative select-none"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header with Crest Seal */}
        <div className="mb-20 text-center flex flex-col items-center space-y-4">
          <div className="mb-2 opacity-90">
            <IllureCrest size={48} className="text-[#B89A62]" />
          </div>

          <span className="typography-eyebrow">
            {subtitle}
          </span>

          <h2 className="typography-h1 text-[#F7F4EE]">
            {title}
          </h2>

          <div className="w-16 h-[1px] bg-[#B89A62]/30 mt-2" />
        </div>

        {/* 4 Refined Editorial Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => (
            <div 
              key={idx}
              className="space-y-4 p-8 border-l border-[#B89A62]/30 hover:border-[#B89A62] transition-colors duration-500 bg-[#121214] rounded-xs group"
            >
              <span className="font-bodoni text-3xl text-[#B89A62] font-light block">
                {pillar.number || `0${idx + 1}`}
              </span>

              <h3 className="font-interface-sans text-xs tracking-[0.25em] text-[#F7F4EE] uppercase font-semibold group-hover:text-[#B89A62] transition-colors">
                {pillar.title}
              </h3>

              <p className="typography-body text-xs text-[#A1A1AA] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
