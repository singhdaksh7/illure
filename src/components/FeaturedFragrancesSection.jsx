import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const FEATURED_PRODUCTS = [
  {
    id: "tf-oud-wood",
    brand: "TOM FORD",
    name: "Oud Wood",
    price: 21500,
    formattedPrice: "₹21,500",
    image: "/images/oud_wood.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
    notes: "Smoky Oud · Sandalwood · Rosewood",
    volume: "100 ML"
  },
  {
    id: "dior-sauvage-elixir",
    brand: "DIOR",
    name: "Sauvage Elixir",
    price: 17900,
    formattedPrice: "₹17,900",
    image: "/images/sauvage.jpg",
    fallbackImage: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800",
    notes: "Spiced Lavender · Liquorice · Sandalwood",
    volume: "60 ML"
  },
  {
    id: "creed-aventus",
    brand: "CREED",
    name: "Aventus",
    price: 32000,
    formattedPrice: "₹32,000",
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=800",
    notes: "Blackcurrant · Italian Bergamot · Oakmoss",
    volume: "100 ML"
  },
  {
    id: "ysl-y-edp",
    brand: "YVES SAINT LAURENT",
    name: "Y Eau de Parfum",
    price: 11500,
    formattedPrice: "₹11,500",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800",
    notes: "Crisp Apple · Sage · Tonka Bean",
    volume: "100 ML"
  }
];

export default function FeaturedFragrancesSection({ onSelectProduct, onAddToCart }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="pt-28 pb-24 md:pt-40 md:pb-36 bg-[#080C0D] relative select-none overflow-hidden">
      
      {/* 1. ATMOSPHERIC TRANSITION BRIDGE FROM HERO */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#080C0D] via-[#0D1214]/60 to-transparent pointer-events-none z-0" />

      {/* Subtle Ambient Radial Backlight Bridge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[300px] bg-[#B89A62]/[0.02] rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Subtle Hairline Editorial Divider Line */}
      <div className="relative z-10 flex justify-center mb-16 md:mb-20">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#B89A62]/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* SECTION HEADER WITH EDITORIAL RHYTHM */}
        <div className="mb-20 space-y-4">
          <div className="flex items-center space-x-3">
            <span className="w-6 h-[1px] bg-[#B89A62]/60" />
            <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-medium">
              01 / CURATED
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h3 className="font-editorial-serif text-4xl md:text-6xl text-[#F2EFE8] font-light tracking-tight">
                OUR SIGNATURE <br />
                <span className="italic font-normal text-[#B89A62]">SELECTION</span>
              </h3>
            </div>
            
            <p className="font-interface-sans text-xs md:text-sm text-[#8F9897] max-w-sm font-light tracking-wide">
              Distinctive fragrances, chosen for character.
            </p>
          </div>
        </div>

        {/* 4 FEATURED PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {FEATURED_PRODUCTS.map((product) => {
            const isHovered = hoveredId === product.id;

            return (
              <div 
                key={product.id}
                className="group cursor-pointer flex flex-col justify-between transition-all duration-500 relative p-4"
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectProduct && onSelectProduct(product.id)}
              >
                {/* SUBTLE BACKGROUND HOVER GLOW */}
                <div 
                  className={`absolute inset-0 rounded-xs transition-opacity duration-700 pointer-events-none ${
                    isHovered ? 'bg-[#101617]/80 opacity-100' : 'bg-transparent opacity-0'
                  }`}
                />

                {/* BOTTLE IMAGE CONTAINER */}
                <div className="relative h-[340px] w-full flex items-center justify-center p-6 overflow-hidden z-10">
                  
                  {/* Subtle radial ambient light on hover */}
                  <div 
                    className={`absolute inset-0 bg-[#B89A62]/[0.05] rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* BOTTLE IMAGE */}
                  <img 
                    src={product.image} 
                    onError={(e) => { e.target.src = product.fallbackImage; }}
                    alt={`${product.brand} ${product.name}`} 
                    className="max-h-full w-auto object-contain transition-transform duration-700 ease-out filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                    style={{
                      transform: isHovered ? 'translateY(-12px) scale(1.06)' : 'translateY(0px) scale(1.0)',
                    }}
                  />
                </div>

                {/* PRODUCT TYPOGRAPHY DETAILS */}
                <div className="pt-6 space-y-2 z-10 flex flex-col items-start text-left">
                  
                  {/* BRAND NAME SMALL UPPERCASE */}
                  <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#8F9897] uppercase font-medium">
                    {product.brand}
                  </span>

                  {/* PERFUME NAME LARGER */}
                  <h4 className="font-editorial-serif text-2xl text-[#F2EFE8] font-normal group-hover:text-[#B89A62] transition-colors duration-300">
                    {product.name}
                  </h4>

                  {/* NOTES & VOLUME */}
                  <p className="font-interface-sans text-[11px] text-[#8F9897]/70 font-light">
                    {product.notes}
                  </p>

                  {/* PRICE & DISCOVER → ACTION */}
                  <div className="pt-3 w-full flex items-center justify-between border-t border-white/[0.04]">
                    <span className="font-interface-sans text-xs tracking-wider text-[#F2EFE8] font-medium">
                      {product.formattedPrice}
                    </span>

                    {/* DISCOVER → APPEARS ON HOVER */}
                    <span 
                      className={`font-interface-sans text-[10px] tracking-[0.25em] text-[#B89A62] uppercase flex items-center space-x-1 transition-all duration-300 ${
                        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                      }`}
                    >
                      <span>DISCOVER</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
