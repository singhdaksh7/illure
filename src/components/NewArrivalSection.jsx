import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import ProductCard from './ProductCard';

export default function NewArrivalSection({ onSelectProduct, onAddToCart }) {
  const { getSection } = useCms();
  const section = getSection('new_arrivals');

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'NEW HORIZONS';
  const subtitle = section?.subtitle || 'RECENT FORMULATIONS';
  const description = section?.description || 'Fresh additions to the İLLURÊ portfolio, showcasing vanguard accords.';
  const ctaLabel = section?.ctaLabel || 'DISCOVER NEW DROPS';

  const campaignProduct = {
    id: "dior-sauvage-elixir",
    brand: "DIOR",
    name: "Sauvage Elixir Absolu",
    inspiredByName: "Dior Sauvage Elixir",
    price: 17900,
    image: "/images/sauvage.jpg",
    notes: "Spiced Lavender · Liquorice · Sandalwood",
    gender: "MEN",
    badge: "NEW DROP",
  };

  const supportingItems = [
    {
      id: "ysl-y-edp",
      brand: "YVES SAINT LAURENT",
      name: "Y Extrait Pure",
      inspiredByName: "YSL Y Eau de Parfum",
      price: 11500,
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
      notes: "Crisp Apple · Sage · Tonka Bean",
      gender: "MEN",
      badge: "NEW",
    },
    {
      id: "creed-aventus",
      brand: "CREED",
      name: "Aventus Sovereign",
      inspiredByName: "Creed Aventus",
      price: 32000,
      image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
      notes: "Blackcurrant · Italian Bergamot · Oakmoss",
      gender: "MEN",
      badge: "LIMITED",
    }
  ];

  return (
    <section 
      id="new-arrival-section" 
      className="py-24 md:py-36 bg-[#0B0B0C] relative select-none overflow-hidden border-b border-white/[0.04]"
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

        {/* Campaign Layout: Dominant Showcase (Top) + Supporting Flacons (Bottom) */}
        <div className="space-y-12">
          
          {/* Dominant Product Showcase Banner */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#121214] border border-[#B89A62]/30 p-8 md:p-14 rounded-xs group cursor-pointer"
            onClick={() => onSelectProduct && onSelectProduct(campaignProduct.id)}
          >
            {/* Left Big Visual */}
            <div className="lg:col-span-7 flex items-center justify-center relative min-h-[360px] md:min-h-[480px]">
              <div className="absolute inset-0 bg-radial from-[#B89A62]/10 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <img 
                src={campaignProduct.image} 
                alt={campaignProduct.name}
                onError={(e) => { e.currentTarget.src = "/images/sauvage.jpg"; }}
                className="max-h-72 md:max-h-96 object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)] group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <span className="absolute top-0 left-0 typography-eyebrow text-[9px] px-3 py-1 bg-[#0B0B0C] border border-[#B89A62]/40">
                CAMPAIGN RELEASE
              </span>
            </div>

            {/* Right Campaign Copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-1">
                <span className="typography-eyebrow text-[#A1A1AA]">
                  {campaignProduct.brand} · PRIVATE BLEND
                </span>
                <h3 className="typography-display text-[#F7F4EE] group-hover:text-[#B89A62] transition-colors">
                  {campaignProduct.name}
                </h3>
                <p className="text-xs text-[#A1A1AA] font-light">
                  Inspired by {campaignProduct.inspiredByName}
                </p>
              </div>

              <p className="typography-body text-[#A1A1AA]">
                Intensely concentrated, raw and potent. A nocturnal rush of spiced nutmeg and lavender infused into a liquorice and smoked sandalwood framework.
              </p>

              <div className="pt-2 flex items-baseline justify-between border-y border-white/[0.08] py-4">
                <div>
                  <span className="text-[9px] tracking-widest text-[#A1A1AA] uppercase block font-mono">
                    EXTRAIT PRICE
                  </span>
                  <span className="font-editorial-serif text-3xl font-light text-[#F7F4EE]">
                    ₹{campaignProduct.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[10px] tracking-widest text-[#B89A62] uppercase font-mono">
                  LIMITED BATCH
                </span>
              </div>

              <div className="pt-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectProduct) onSelectProduct(campaignProduct.id);
                  }}
                  className="group inline-flex items-center space-x-3 px-8 py-4 bg-[#B89A62] hover:bg-[#C0A46D] text-[#0B0B0C] font-interface-sans text-xs tracking-[0.28em] font-semibold uppercase transition-all duration-300 rounded-xs shadow-[0_10px_25px_rgba(184,154,98,0.2)]"
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="w-4 h-4 text-[#0B0B0C] group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Supporting Arrivals Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {supportingItems.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
