import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import IllureCrest from './IllureCrest';
import { useCms } from '../context/CmsContext';

export default function BrandStorySection({ onDiscoverStory }) {
  const { getSection } = useCms();
  const section = getSection('brand_story');

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'THE ARCHITECTURE OF SCENT';
  const subtitle = section?.subtitle || 'OUR MAISON';
  const description = section?.description || 'İLLURÊ FRAGRANCE was born from a fundamental belief: extraordinary perfumery should be a daily luxury, not an inaccessible artifact. Inspired by iconic classics yet formulated with our proprietary extrait craftsmanship.';
  const ctaLabel = section?.ctaLabel || 'EXPLORE OUR HERITAGE';
  const custom = section?.customData || {};
  const quote = custom.quote || '“We sculpt memories in liquid form, balancing shadow and illumination in every flacon.”';
  const signature = custom.founderSignature || 'The İLLURÊ Laboratory';
  const image = section?.desktopImage || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200';
  const layout = section?.layoutVariant || 'IMAGE_LEFT';

  const isImageRight = layout === 'IMAGE_RIGHT';

  return (
    <section 
      id="brand-story-section" 
      className="py-24 md:py-36 bg-[#0B0B0C] relative select-none overflow-hidden border-b border-white/[0.04]"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${isImageRight ? 'lg:flex-row-reverse' : ''}`}>
          
          {/* IMAGE COLUMN */}
          <div className={`lg:col-span-6 relative ${isImageRight ? 'lg:order-2' : ''}`}>
            <div className="relative h-[480px] sm:h-[600px] w-full rounded-xs overflow-hidden border border-[#B89A62]/25 group">
              <img 
                src={image} 
                alt="İLLURÊ Haute Parfumerie Atelier" 
                className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.08] group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-75" />

              {/* Floating Atelier Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#121214]/95 backdrop-blur-md border border-[#B89A62]/30 p-5 rounded-xs space-y-1.5 shadow-2xl">
                <div className="flex items-center space-x-2">
                  <IllureCrest size={18} className="text-[#B89A62]" />
                  <span className="typography-eyebrow text-[9px] text-[#B89A62]">
                    ATELIER FORMULATION · EXTRACT DE PARFUM
                  </span>
                </div>
                <p className="font-editorial-serif text-base text-[#F7F4EE] italic">
                  {quote}
                </p>
                <span className="text-[10px] tracking-wider text-[#A1A1AA] uppercase block font-mono">
                  — {signature}
                </span>
              </div>
            </div>
          </div>

          {/* EDITORIAL CONTENT COLUMN */}
          <div className={`lg:col-span-6 space-y-8 ${isImageRight ? 'lg:order-1 lg:pr-6' : 'lg:pl-6'}`}>
            
            {/* Header Identity */}
            <div className="flex items-center space-x-3">
              <IllureCrest size={28} className="text-[#B89A62]" />
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-[1px] bg-[#B89A62]" />
                  <span className="typography-eyebrow">
                    {subtitle}
                  </span>
                </div>
                <span className="font-bodoni text-xs tracking-[0.3em] uppercase text-[#A1A1AA]">
                  İLLURÊ MAISON
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h2 className="typography-display text-[#F7F4EE]">
              {title}
            </h2>

            {/* Narrative Body */}
            <div className="space-y-4">
              <p className="typography-body-large text-[#E3DCD0]">
                {description}
              </p>
              <p className="typography-body text-[#A1A1AA]">
                Our perfumers compose complex accords using rare raw extracts: wild oud resin from Assam, harvested iris concrete from Tuscany, and distilled sea minerals. Each batch is aged in controlled obsidian vaults until absolute harmony is attained.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center space-x-6">
              <button 
                onClick={onDiscoverStory}
                className="group inline-flex items-center space-x-3 px-8 py-4 bg-[#121214] border border-[#B89A62]/40 hover:border-[#B89A62] text-[#F7F4EE] font-interface-sans text-xs tracking-[0.28em] uppercase transition-all duration-300 hover:bg-[#18181B] shadow-lg"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4 text-[#B89A62] group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
