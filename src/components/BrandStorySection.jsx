import React from 'react';
import { ArrowRight } from 'lucide-react';
import IllureCrest from './IllureCrest';
import { useCms } from '../context/CmsContext';

export default function BrandStorySection({ onDiscoverStory }) {
  const { getSection } = useCms();
  const section = getSection('brand_story');

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'SCENT, WITHOUT THE NOISE';
  const subtitle = section?.subtitle || 'THE İLLURÊ STORY';
  const description = section?.description || 'We started İLLURÊ for one simple reason: good fragrance shouldn’t feel complicated. We take scent profiles people already love and reinterpret them in our own way. Easy to try. Easy to carry. Easy to make yours.';
  const ctaLabel = section?.ctaLabel || 'EXPLORE FRAGRANCES';
  const custom = section?.customData || {};
  const quote = custom.quote || '“Familiar inspiration. Our own point of view.”';
  const signature = custom.founderSignature || 'The İLLURÊ Team';
  const image = section?.desktopImage || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200';
  const layout = section?.layoutVariant || 'IMAGE_LEFT';

  const isImageRight = layout === 'IMAGE_RIGHT';

  return (
    <section 
      id="brand-story-section" 
      className="py-24 md:py-36 bg-[#14120F] relative select-none overflow-hidden border-b border-[#D8BE82]/15"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${isImageRight ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* IMAGE COLUMN */}
          <div className={`lg:col-span-6 relative ${isImageRight ? 'lg:order-2' : ''}`}>
            <div className="relative h-[480px] sm:h-[600px] w-full rounded-xs overflow-hidden border border-[#D8BE82]/30 group shadow-2xl">
              <img 
                src={image} 
                alt="İLLURÊ Atelier" 
                onError={(e) => { e.currentTarget.src = "/images/illure-placeholder.svg"; }}
                className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.08] group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A0B] via-transparent to-transparent opacity-80" />

              {/* Floating Atelier Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#0E1011]/95 backdrop-blur-md border border-[#D8BE82]/35 p-5 rounded-xs space-y-1.5 shadow-2xl">
                <div className="flex items-center space-x-2">
                  <IllureCrest size={18} className="text-[#D8BE82]" />
                  <span className="typography-eyebrow text-[9px] text-[#D8BE82]">
                    İLLURÊ FRAGRANCE
                  </span>
                </div>
                <p className="font-editorial-serif text-base text-[#F7F3EA] italic">
                  {quote}
                </p>
                <span className="text-[10px] tracking-wider text-[#D8D0C3] uppercase block font-mono">
                  — {signature}
                </span>
              </div>
            </div>
          </div>

          {/* EDITORIAL CONTENT COLUMN */}
          <div className={`lg:col-span-6 space-y-8 ${isImageRight ? 'lg:order-1 lg:pr-6' : 'lg:pl-6'}`}>
            
            {/* Header Identity */}
            <div className="flex items-center space-x-3">
              <IllureCrest size={28} className="text-[#D8BE82]" />
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-[1px] bg-[#C7A866]" />
                  <span className="typography-eyebrow">
                    {subtitle}
                  </span>
                </div>
                <span className="font-bodoni text-xs tracking-[0.3em] uppercase text-[#D8D0C3]">
                  CONTEMPORARY FRAGRANCE
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h2 className="typography-display text-[#F7F3EA]">
              {title}
            </h2>

            {/* Narrative Body */}
            <div className="space-y-4 max-w-[620px]">
              <p className="typography-body-large text-[#F7F3EA]">
                {description}
              </p>
              <p className="typography-body text-[#D8D0C3] font-light">
                We combine high-grade fragrance oils with balanced formulation to deliver distinct presence and clean day-to-night transitions. Simple profiles, high character, and uncompromising presentation.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center space-x-6">
              <button 
                onClick={onDiscoverStory}
                className="group inline-flex items-center space-x-3 px-8 py-4 bg-[#080A0B] border border-[#D8BE82]/40 hover:border-[#D8BE82] text-[#F7F3EA] font-interface-sans text-xs tracking-[0.28em] uppercase transition-all duration-300 hover:bg-[#14120F] shadow-lg"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4 text-[#D8BE82] group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
