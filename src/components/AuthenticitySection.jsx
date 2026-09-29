import React from 'react';
import IllureCrest from './IllureCrest';

const PROMISES = [
  {
    number: "01",
    title: "100% AUTHENTIC",
    description: "Sourced directly from authorized fragrance houses and master perfumers worldwide with original İLLURÊ seals."
  },
  {
    number: "02",
    title: "PREMIUM SELECTION",
    description: "Every fragrance is hand-evaluated for character, longevity, and noble olfactory distinction."
  },
  {
    number: "03",
    title: "HERITAGE PACKAGING",
    description: "Signature matte black & antique gold packaging with climate-controlled white-glove delivery."
  },
  {
    number: "04",
    title: "CURATED WITH CARE",
    description: "Personalized scent consultations and complimentary luxury sample discovery with every order."
  }
];

export default function AuthenticitySection() {
  return (
    <section className="py-24 md:py-36 bg-[#080C0D] border-t border-white/[0.05] relative select-none">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* SECTION HEADING WITH CREST EMBLEM SEAL */}
        <div className="mb-20 text-center flex flex-col items-center space-y-4">
          <div className="mb-2">
            <IllureCrest className="w-20 sm:w-24 h-auto" color="#B89A62" variant="simplified" />
          </div>

          <span className="font-interface-sans text-[10px] tracking-[0.35em] text-[#B89A62] uppercase font-medium">
            İLLURÊ GUARANTEE OF EXCELLENCE
          </span>

          <h3 className="font-editorial-serif text-4xl sm:text-6xl text-[#F2EFE8] font-light tracking-tight">
            ONLY THE <br />
            <span className="italic font-normal text-[#B89A62]">EXCEPTIONAL.</span>
          </h3>
        </div>

        {/* 4 MINIMAL PROMISES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {PROMISES.map((promise) => (
            <div 
              key={promise.number}
              className="space-y-4 p-6 border-l border-white/[0.08] hover:border-[#B89A62] transition-colors duration-500 bg-[#101617]/40 rounded-xs"
            >
              <span className="font-bodoni text-2xl text-[#B89A62] font-light">
                {promise.number}
              </span>

              <h4 className="font-interface-sans text-xs tracking-[0.25em] text-[#F2EFE8] uppercase font-semibold">
                {promise.title}
              </h4>

              <p className="font-interface-sans text-xs text-[#8F9897] font-light leading-relaxed">
                {promise.description}
              </p>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
