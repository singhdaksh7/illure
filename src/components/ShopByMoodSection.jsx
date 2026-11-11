import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCms } from '../context/CmsContext';

const DEFAULT_MOODS = [
  {
    id: "after-dark",
    name: "AFTER DARK",
    tagline: "Smoky Amber & Cedar",
    description: "Deep, warm, made for evenings that run late.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=900",
    filter: "evening",
  },
  {
    id: "first-impression",
    name: "FIRST IMPRESSION",
    tagline: "Bergamot & Crisp Pepper",
    description: "Sharp, clean opening that commands attention.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=900",
    filter: "day",
  },
  {
    id: "everyday",
    name: "EVERYDAY",
    tagline: "Iris & Dry Woods",
    description: "Low-key presence. You don’t need an occasion.",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=900",
    filter: "signature",
  },
  {
    id: "date-night",
    name: "DATE NIGHT",
    tagline: "Warm Vanilla & Spiced Tobacco",
    description: "Intimate and close. Best on skin.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=900",
    filter: "bestsellers",
  },
  {
    id: "the-weekend",
    name: "THE WEEKEND",
    tagline: "Mineral Musk & Sea Salt",
    description: "Clean with an edge. Easy to wear anywhere.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=900",
    filter: "fresh",
  },
];

export default function ShopByMoodSection({ onSelectMood }) {
  const { getSection } = useCms();
  const section = getSection('shop_by_mood');
  const [activeMoodId, setActiveMoodId] = useState("after-dark");

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'SHOP BY MOOD';
  const subtitle = section?.subtitle || 'WHEN TO WEAR';
  const description = section?.description || 'Pick the mood. Make it yours.';
  const moods = section?.customData?.moods || DEFAULT_MOODS;

  return (
    <section 
      id="shop-by-mood-section" 
      className="py-24 md:py-36 bg-[#080A0B] relative select-none border-b border-[#D8BE82]/15"
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
              03 / OCCASION
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="typography-h1 text-[#F7F3EA]">
              {title}
            </h2>
            <p className="typography-body text-[#D8D0C3] max-w-md">
              {description}
            </p>
          </div>
        </div>

        {/* 5 Full-Bleed Mood Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {moods.map((mood) => {
            const isActive = activeMoodId === mood.id;

            return (
              <div 
                key={mood.id}
                className="group relative h-[420px] rounded-xs overflow-hidden cursor-pointer flex flex-col justify-between p-6 border border-[#D8BE82]/20 transition-all duration-700 hover:border-[#D8BE82]/70 hover:shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
                onMouseEnter={() => setActiveMoodId(mood.id)}
                onClick={() => onSelectMood && onSelectMood(mood.id || mood.filter)}
              >
                {/* Atmospheric Image Canvas */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out filter brightness-[0.55] contrast-[1.12]"
                  style={{
                    backgroundImage: `url(${mood.image})`,
                    transform: isActive ? 'scale(1.08)' : 'scale(1.0)',
                  }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080A0B] via-[#080A0B]/50 to-transparent opacity-95" />

                {/* Top Label */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="typography-eyebrow text-[9px] text-[#D8BE82]">
                    MOOD ARCHIVE
                  </span>
                  <ArrowRight className={`w-4 h-4 text-[#D8BE82] transition-all duration-300 ${
                    isActive ? 'translate-x-1 opacity-100' : 'opacity-0'
                  }`} />
                </div>

                {/* Bottom Copy */}
                <div className="relative z-10 space-y-2.5">
                  <h4 className="font-editorial-serif text-2xl text-[#F7F3EA] group-hover:text-[#D8BE82] transition-colors leading-tight">
                    {mood.name}
                  </h4>
                  <p className="text-[11px] font-medium text-[#F7F3EA]/90 line-clamp-1">
                    {mood.tagline}
                  </p>
                  <p className="text-[11px] text-[#D8D0C3] font-light leading-relaxed line-clamp-2">
                    {mood.description}
                  </p>
                  <div className="pt-2 flex items-center space-x-1 text-[9px] tracking-widest text-[#D8BE82] uppercase font-semibold">
                    <span>EXPLORE MOOD</span>
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
