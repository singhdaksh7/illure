import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const MOODS = [
  {
    id: "woody",
    name: "WOODY",
    descriptors: ["Warm", "Confident", "Grounded"],
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800",
    description: "Enveloping cedarwood, sandalwood, and smoky rare woods."
  },
  {
    id: "fresh",
    name: "FRESH",
    descriptors: ["Clean", "Crisp", "Effortless"],
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
    description: "Vibrant marine accords, iced citrus zest, and mountain air."
  },
  {
    id: "oud",
    name: "OUD",
    descriptors: ["Rich", "Intense", "Mysterious"],
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
    description: "Precious agarwood, dark spices, leather, and incense smoke."
  },
  {
    id: "amber",
    name: "AMBER",
    descriptors: ["Warm", "Sensual", "Deep"],
    image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800",
    description: "Rich resins, sweet tonka bean, and golden vanilla warmth."
  },
  {
    id: "citrus",
    name: "CITRUS",
    descriptors: ["Bright", "Energetic", "Modern"],
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800",
    description: "Calabrian Bergamot, Sicilian Lemon, and Neroli blossom."
  }
];

export default function ShopByMoodSection({ onSelectMood }) {
  const [activeMoodId, setActiveMoodId] = useState("woody");

  return (
    <section className="py-24 md:py-36 bg-[#080C0D] relative select-none">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* SECTION HEADER */}
        <div className="mb-16 space-y-4">
          <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-medium">
            03 / CHARACTER
          </span>

          <h3 className="font-editorial-serif text-4xl md:text-6xl text-[#F2EFE8] font-light tracking-tight">
            WHAT WILL YOU <br />
            <span className="italic font-normal text-[#B89A62]">LEAVE BEHIND?</span>
          </h3>
        </div>

        {/* 5 ATMOSPHERIC CATEGORY CARDS / TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {MOODS.map((mood) => {
            const isActive = activeMoodId === mood.id;

            return (
              <div 
                key={mood.id}
                className="group relative h-[380px] rounded-xs overflow-hidden cursor-pointer flex flex-col justify-between p-6 border border-white/[0.06] transition-all duration-500 hover:border-[#B89A62]/50"
                onMouseEnter={() => setActiveMoodId(mood.id)}
                onClick={() => onSelectMood && onSelectMood(mood.id)}
              >
                {/* ATMOSPHERIC BACKGROUND IMAGE */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out filter brightness-[0.6] contrast-[1.1]"
                  style={{
                    backgroundImage: `url(${mood.image})`,
                    transform: isActive ? 'scale(1.08)' : 'scale(1.0)',
                  }}
                />

                {/* DARK GRADIENT OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080C0D] via-[#080C0D]/50 to-transparent opacity-85" />

                {/* TOP CONTENT */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="font-interface-sans text-[9px] tracking-[0.3em] text-[#B89A62] uppercase">
                    MOOD
                  </span>
                  <ArrowRight className={`w-4 h-4 text-[#B89A62] transition-transform duration-300 ${
                    isActive ? 'translate-x-1' : 'opacity-0'
                  }`} />
                </div>

                {/* BOTTOM CONTENT */}
                <div className="relative z-10 space-y-3">
                  <h4 className="font-editorial-serif text-3xl text-[#F2EFE8] font-light tracking-wide group-hover:text-[#B89A62] transition-colors">
                    {mood.name}
                  </h4>

                  {/* DESCRIPTORS */}
                  <div className="space-y-0.5 font-interface-sans text-[11px] text-[#8F9897] font-light">
                    {mood.descriptors.map((desc, dIdx) => (
                      <span key={dIdx} className="block">{desc}</span>
                    ))}
                  </div>

                  <p className="font-interface-sans text-[10px] text-[#8F9897]/70 line-clamp-2 pt-2 border-t border-white/[0.06]">
                    {mood.description}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
}
