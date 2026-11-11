import React, { useState } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useCms } from '../context/CmsContext';

const DEFAULT_COLLECTIONS = [
  {
    id: "him",
    title: "AFTER DARK",
    subtitle: "SMOKE & AMBER",
    descriptors: ["Smoky Woods", "Birch", "Rich Amber"],
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000",
    genderFilter: "MEN",
    categoryFilter: null
  },
  {
    id: "her",
    title: "WARM & SENSUAL",
    subtitle: "FLORAL & RESIN",
    descriptors: ["Damask Rose", "Sunlit Jasmine", "Cashmere Amber"],
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
    genderFilter: "WOMEN",
    categoryFilter: null
  },
  {
    id: "niche",
    title: "CLEAN WITH AN EDGE",
    subtitle: "EVERYDAY SIGNATURES",
    descriptors: ["Bergamot", "Cedar", "Mineral Musk"],
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000",
    genderFilter: "UNISEX",
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
  const subtitle = section?.subtitle || 'FRAGRANCE DIRECTIONS';
  const description = section?.description || 'Pick your profile. From heavy ambers to crisp woods.';
  const collections = DEFAULT_COLLECTIONS;

  return (
    <section 
      id="collections-section" 
      className="py-24 md:py-36 bg-[#0E1011] relative select-none border-b border-[#D8BE82]/15"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-[1px] bg-[#C7A866]" />
              <span className="typography-eyebrow">
                {subtitle}
              </span>
            </div>
            <span className="font-mono text-xs tracking-[0.25em] text-[#C7A866]/60 font-medium">
              02 / EDITIONS
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="typography-h1 text-[#F7F3EA]">
              {title}
            </h2>
            <p className="typography-body text-[#D8D0C3] max-w-sm">
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
                className="group relative h-[520px] md:h-[620px] rounded-xs overflow-hidden cursor-pointer select-none flex flex-col justify-between p-8 md:p-10 border border-[#D8BE82]/20 transition-all duration-700 hover:border-[#D8BE82]/70 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)]"
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
                      ? 'bg-gradient-to-t from-[#080A0B] via-[#080A0B]/70 to-black/35 opacity-95' 
                      : 'bg-gradient-to-t from-[#080A0B] via-[#080A0B]/50 to-black/45 opacity-90'
                  }`}
                />

                {/* Top Meta Bar */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="typography-eyebrow text-[9px] text-[#D8BE82]">
                    EDITION 0{idx + 1}
                  </span>
                  
                  {/* Arrow Indicator */}
                  <div className={`p-3 rounded-full border border-white/10 backdrop-blur-md transition-all duration-500 ${
                    isHovered ? 'bg-[#D8BE82] text-[#080A0B] border-[#D8BE82]' : 'bg-[#080A0B]/70 text-[#F7F3EA]'
                  }`}>
                    <ArrowUpRight className={`w-4 h-4 transition-transform duration-500 ${
                      isHovered ? 'translate-x-0.5 -translate-y-0.5' : ''
                    }`} />
                  </div>
                </div>

                {/* Bottom Copy Block */}
                <div className="relative z-10 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-[0.25em] text-[#D8BE82] uppercase block font-medium">
                      {col.subtitle}
                    </span>
                    <h4 className="font-editorial-serif text-4xl lg:text-5xl text-[#F7F3EA] font-light tracking-wide group-hover:text-[#D8BE82] transition-colors duration-500">
                      {col.title}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {col.descriptors.map((desc, dIdx) => (
                      <span 
                        key={dIdx}
                        className="text-[11px] text-[#D8D0C3] font-light bg-[#14120F]/90 px-2.5 py-1 border border-[#D8BE82]/20 rounded-xs"
                      >
                        {desc}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center space-x-2 text-xs tracking-widest text-[#D8BE82] uppercase font-semibold">
                    <span>EXPLORE EDITION</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Bottom Gold Hairline */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D8BE82] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
