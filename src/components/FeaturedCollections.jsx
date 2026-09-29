import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function FeaturedCollections({ onSelectCollection }) {
  const collections = [
    {
      id: 'him',
      title: 'FOR HIM',
      subtitle: 'Commanding · Intense · Magnetic',
      gender: 'Him',
      category: null,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'her',
      title: 'FOR HER',
      subtitle: 'Radiant · Velvet · Captivating',
      gender: 'Her',
      category: null,
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'niche',
      title: 'NICHE FRAGRANCES',
      subtitle: 'Rare · Artisanal · Avant-Garde',
      gender: null,
      category: 'niche',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: 'classics',
      title: 'ICONIC CLASSICS',
      subtitle: 'Timeless · Celebrated · Legendary',
      gender: null,
      category: 'classics',
      image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800'
    }
  ];

  return (
    <section className="py-24 bg-[#080B0D] border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
          <div>
            <span className="font-sans-clean text-xs font-semibold tracking-[0.3em] text-[#D4AF37] uppercase">
              EDITORIAL SELECTIONS
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl text-[#F4F1EA] font-light mt-2">
              CURATED FOR EVERY PRESENCE
            </h2>
          </div>
          <p className="font-sans-clean text-xs text-[#A39E93] max-w-sm tracking-wider uppercase">
            Distinctive fragrance profiles crafted to align with mood, character, and occasion.
          </p>
        </div>

        {/* 4 Large Editorial Photography Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((col) => (
            <div 
              key={col.id}
              onClick={() => onSelectCollection(col.gender, col.category)}
              className="group relative h-[450px] sm:h-[500px] overflow-hidden rounded-sm cursor-pointer border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-500"
            >
              {/* Background Image with Zoom Effect */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${col.image})` }}
              />

              {/* Dark Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B0D] via-[#080B0D]/50 to-transparent opacity-85 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-end text-left z-10">
                <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
                  <span className="font-sans-clean text-xs font-medium tracking-[0.25em] text-[#E6C687] uppercase block mb-2">
                    {col.subtitle}
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-luxury text-3xl sm:text-4xl text-[#F4F1EA] font-normal tracking-wide group-hover:text-gold-gradient transition-colors">
                      {col.title}
                    </h3>
                    
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-[#F4F1EA] group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#080B0D] transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
