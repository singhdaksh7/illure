import React, { useState } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useCms } from '../context/CmsContext';

const DEFAULT_COLLECTIONS = [
  {
    id: "him",
    title: "FOR HIM",
    subtitle: "COMMAND & INTENSITY",
    descriptors: ["Smoky Woods", "Italian Citrus", "Rich Amber"],
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000",
    genderFilter: "Him",
    categoryFilter: null
  },
  {
    id: "her",
    title: "FOR HER",
    subtitle: "SENSUAL & LUMINOUS",
    descriptors: ["Velvet Rose", "Sunlit Jasmine", "White Amber"],
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
    genderFilter: "Her",
    categoryFilter: null
  },
  {
    id: "niche",
    title: "NICHE & UNISEX",
    subtitle: "RARE ARTISANAL BLENDS",
    descriptors: ["Smoky Agarwood", "Rare Iris Concrete", "Balsam"],
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000",
    genderFilter: "Unisex",
    categoryFilter: "niche"
  }
];

export default function CollectionsSection({ onSelectCollection }) {
  const { getSection } = useCms();
  const section = getSection('collections');

  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'THE EDITIONS';
  const subtitle = section?.subtitle || 'STRUCTURED HARMONIES';
  const description = section?.description || 'Organized by olfactory architecture, from solar woods to velvet resins.';
  const collections = DEFAULT_COLLECTIONS;

  return (
    <section 
      id="collections-section" 
      className="py-24 md:py-36 bg-[#0B0B0C] relative select-none border-b border-white/[0.04]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-20 space-y-4">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-[1px] bg-[#B89A62]" />
            <span className="typography-eyebrow">
              {subtitle}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="typography-h1 text-[#F7F4EE]">
              {title}
            </h2>
            <p className="typography-body max-w-sm">
              {description}
            </p>
          </div>
        </div>

        {/* 3 Tall Cinematic Editorial Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <div 
                key={col.id}
                className="group relative h-[520px] md:h-[620px] rounded-xs overflow-hidden cursor-pointer select-none flex flex-col justify-between p-8 md:p-10 border border-white/[0.08] transition-all duration-700 hover:border-[#B89A62]/60 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)]"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectCollection && onSelectCollection(col.genderFilter, col.categoryFilter)}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out filter brightness-[0.7] contrast-[1.08]"
                  style={{
                    backgroundImage: `url(${col.image})`,
                    transform: isHovered ? 'scale(1.08)' : 'scale(1.0)',
                  }}
                />

                {/* Dark Vignette Gradient */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isHovered 
                      ? 'bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/65 to-black/30 opacity-95' 
                      : 'bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/45 to-black/40 opacity-85'
                  }`}
                />

                {/* Top Meta Bar */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="typography-eyebrow text-[9px] text-[#B89A62]">
                    EDITION 0{idx + 1}
                  </span>
                  
                  {/* Arrow Indicator */}
                  <div className={`p-3 rounded-full border border-white/10 backdrop-blur-md transition-all duration-500 ${
                    isHovered ? 'bg-[#B89A62] text-[#0B0B0C] border-[#B89A62]' : 'bg-[#0B0B0C]/60 text-[#F7F4EE]'
                  }`}>
                    <ArrowUpRight className={`w-4 h-4 transition-transform duration-500 ${
                      isHovered ? 'translate-x-0.5 -translate-y-0.5' : ''
                    }`} />
                  </div>
                </div>

                {/* Bottom Copy Block */}
                <div className="relative z-10 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-[0.25em] text-[#B89A62] uppercase block font-medium">
                      {col.subtitle}
                    </span>
                    <h4 className="font-editorial-serif text-4xl lg:text-5xl text-[#F7F4EE] font-light tracking-wide group-hover:text-[#B89A62] transition-colors duration-500">
                      {col.title}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {col.descriptors.map((desc, dIdx) => (
                      <span 
                        key={dIdx}
                        className="text-[11px] text-[#A1A1AA] font-light bg-[#121214]/80 px-2.5 py-1 border border-white/[0.06] rounded-xs"
                      >
                        {desc}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center space-x-2 text-xs tracking-widest text-[#B89A62] uppercase font-semibold">
                    <span>EXPLORE EDITION</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Bottom Gold Hairline */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B89A62] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
