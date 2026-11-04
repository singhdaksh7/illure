import React from 'react';
import IllureCrest from './IllureCrest';
import { useCms } from '../context/CmsContext';

const DEFAULT_PILLARS = [
  {
    number: "I",
    title: "CRAFTED WITH INTENT",
    description: "Every formulation is aged in controlled vaults to attain maximum extrait oil saturation, resulting in 14+ hours of persistent sillage."
  },
  {
    number: "II",
    title: "SMALL FORMAT, FULL CHARACTER",
    description: "Flacons calibrated specifically for intimate tactile weight, air-travel compliance, and daily ritual without dilution."
  },
  {
    number: "III",
    title: "PACKAGED BY İLLURÊ",
    description: "Signature obsidian presentation boxes lined with velvet touch cushioning, sealed by hand under the heraldic crest of the Maison."
  },
  {
    number: "IV",
    title: "DELIVERED WITH CARE",
    description: "Complimentary climate-controlled white-glove transit across India, guaranteed tamper-proof and fully insured."
  }
];

export default function AuthenticitySection() {
  const { getSection } = useCms();
  const section = getSection('authenticity');

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'THE İLLURÊ PROMISE';
  const subtitle = section?.subtitle || 'UNCOMPROMISING STANDARDS';
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
