import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const COLLECTIONS = [
  {
    id: "him",
    title: "FOR HIM",
    descriptors: ["Confident.", "Refined.", "Unforgettable."],
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000",
    genderFilter: "Him"
  },
  {
    id: "her",
    title: "FOR HER",
    descriptors: ["Elegant.", "Expressive.", "Distinctive."],
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
    genderFilter: "Her"
  },
  {
    id: "niche",
    title: "NICHE",
    descriptors: ["Rare.", "Unexpected.", "Extraordinary."],
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000",
    categoryFilter: "niche"
  }
];

export default function CollectionsSection({ onSelectCollection }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="py-24 md:py-36 bg-[#080C0D] relative select-none">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* SECTION HEADER */}
        <div className="mb-16 space-y-4">
          <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-medium">
            02 / DISCOVER
          </span>

          <h3 className="font-editorial-serif text-4xl md:text-6xl text-[#F2EFE8] font-light tracking-tight">
            FIND YOUR <br />
            <span className="italic font-normal text-[#B89A62]">SIGNATURE</span>
          </h3>
        </div>

        {/* 3 TALL CINEMATIC EDITORIAL PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLLECTIONS.map((col, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <div 
                key={col.id}
                className="group relative h-[520px] md:h-[620px] rounded-xs overflow-hidden cursor-pointer select-none flex flex-col justify-between p-8 md:p-10 border border-white/[0.06] transition-all duration-700 hover:border-[#B89A62]/50"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectCollection && onSelectCollection(col.genderFilter, col.categoryFilter)}
              >
                {/* CINEMATIC BACKGROUND IMAGE WITH SLOW ZOOM */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out filter brightness-[0.75] contrast-[1.05]"
                  style={{
                    backgroundImage: `url(${col.image})`,
                    transform: isHovered ? 'scale(1.08)' : 'scale(1.0)',
                  }}
                />

                {/* DARK OVERLAY GRADIENT */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isHovered 
                      ? 'bg-gradient-to-t from-[#080C0D] via-[#080C0D]/60 to-black/30 opacity-90' 
                      : 'bg-gradient-to-t from-[#080C0D] via-[#080C0D]/40 to-black/40 opacity-80'
                  }`}
                />

                {/* TOP CARD CONTENT */}
                <div className="relative z-10 flex justify-between items-start">
                  <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#8F9897] uppercase">
                    COLLECTION 0{idx + 1}
                  </span>
                  
                  {/* ARROW MOVES ON HOVER */}
                  <div className={`p-3 rounded-full border border-white/10 backdrop-blur-md transition-all duration-500 ${
                    isHovered ? 'bg-[#B89A62] text-[#080C0D] border-[#B89A62]' : 'bg-black/30 text-[#F2EFE8]'
                  }`}>
                    <ArrowUpRight className={`w-5 h-5 transition-transform duration-500 ${
                      isHovered ? 'translate-x-0.5 -translate-y-0.5' : ''
                    }`} />
                  </div>
                </div>

                {/* BOTTOM CARD CONTENT */}
                <div className="relative z-10 space-y-4">
                  
                  {/* TITLE */}
                  <h4 className="font-editorial-serif text-4xl lg:text-5xl text-[#F2EFE8] font-light tracking-wide group-hover:text-[#B89A62] transition-colors duration-500">
                    {col.title}
                  </h4>

                  {/* DESCRIPTORS */}
                  <div className="space-y-1 font-interface-sans text-xs tracking-wider text-[#8F9897] font-light">
                    {col.descriptors.map((desc, dIdx) => (
                      <p key={dIdx}>{desc}</p>
                    ))}
                  </div>

                  {/* EXPLORE COLLECTION CTA */}
                  <div className={`pt-2 flex items-center space-x-2 text-[10px] tracking-[0.25em] text-[#B89A62] uppercase transition-all duration-500 ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-1'
                  }`}>
                    <span>EXPLORE COLLECTION</span>
                    <span>→</span>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
