import React, { useState } from 'react';
import { ArrowRight, ShoppingBag, Check } from 'lucide-react';
import PerfumeBottleVisual from './PerfumeBottleVisual';

export default function ProductCard({
  product,
  onSelectProduct,
  onAddToCart,
}) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  // Determine starting price from variants if available, or fallback
  const startingPrice = product.price || 
    (product.variants && product.variants.length > 0 
      ? Math.min(...product.variants.map(v => Number(v.price)))
      : 21500);

  const formattedPrice = startingPrice.toLocaleString('en-IN');

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const badge = product.badge || 
    (product.bestseller ? 'BESTSELLER' : product.newArrival ? 'NEW ARRIVAL' : null);

  const inspiredBy = product.inspiredByName || product.brand;
  const referenceHouse = product.referenceBrand?.name || product.brand;

  return (
    <div
      className="editorial-tile group relative flex flex-col justify-between p-5 md:p-6 cursor-pointer select-none overflow-hidden"
      onClick={() => onSelectProduct && onSelectProduct(product.id || product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Meta Bar: Badge & Formulation Tag */}
      <div className="flex items-center justify-between z-10 min-h-[22px]">
        {badge ? (
          <span className="font-interface-sans text-[8px] md:text-[9px] font-semibold tracking-[0.25em] text-[#B89A62] border border-[#B89A62]/30 px-2 py-0.5 rounded-xs uppercase bg-[#0B0B0C]/80">
            {badge}
          </span>
        ) : (
          <span className="text-[8px] tracking-[0.25em] text-[#A1A1AA]/70 uppercase">
            EXTRAIT DE PARFUM
          </span>
        )}
        <span className="text-[9px] tracking-[0.2em] text-[#A1A1AA]/50 font-mono">
          {product.gender || 'UNISEX'}
        </span>
      </div>

      {/* Centerpiece Bottle Image Container */}
      <div className="relative h-64 md:h-72 w-full flex items-center justify-center my-4 overflow-hidden">
        {/* Soft Radial Ambient Aura */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundColor: product.accentGlow || 'rgba(184, 154, 98, 0.12)',
            opacity: hovered ? 0.6 : 0.2,
          }}
        />

        {/* Studio Bottle Visual */}
        <div className="relative z-10 transition-transform duration-700 ease-out transform group-hover:scale-105">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              className="max-h-56 md:max-h-60 w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter brightness-[1.04]"
            />
          ) : (
            <PerfumeBottleVisual
              liquidColor={product.liquidColor || "#3B2314"}
              accentGlow={product.accentGlow}
              brandName={inspiredBy}
              perfumeName={product.name}
              concentration={product.concentration || 'Extrait de Parfum'}
              height={210}
              interactive={false}
            />
          )}
        </div>

        {/* Hover Quick View Button Reveal */}
        <div className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-20 bg-gradient-to-t from-[#121214] via-[#121214]/90 to-transparent">
          <div className="w-full flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct && onSelectProduct(product.id || product);
              }}
              className="flex-1 py-2 px-3 bg-[#18181B] hover:bg-[#27272A] border border-white/[0.1] text-[#F7F4EE] text-[9px] tracking-[0.25em] uppercase font-medium transition-colors"
            >
              VIEW FRAGRANCE
            </button>
            <button
              onClick={handleQuickAdd}
              className={`py-2 px-3 border border-[#B89A62]/40 text-[9px] tracking-[0.2em] uppercase font-semibold transition-all ${
                added
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-[#B89A62] text-[#0B0B0C] hover:bg-[#C0A46D]'
              }`}
              title="Quick Add to Bag"
            >
              {added ? <Check className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Information */}
      <div className="space-y-2 pt-2 border-t border-white/[0.04]">
        <div className="space-y-0.5">
          <span className="text-[8px] md:text-[9px] tracking-[0.25em] text-[#B89A62] uppercase font-medium block">
            İLLURÊ COLLECTION
          </span>
          <h3 className="font-editorial-serif text-xl md:text-2xl text-[#F7F4EE] group-hover:text-[#B89A62] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#A1A1AA] font-light line-clamp-1">
            Inspired by <span className="text-[#E3DCD0]">{inspiredBy}</span>
            {referenceHouse && referenceHouse !== inspiredBy && ` · ${referenceHouse}`}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div>
            <span className="text-[9px] tracking-wider text-[#A1A1AA] uppercase block font-mono">
              FROM
            </span>
            <span className="font-interface-sans text-xs md:text-sm font-semibold text-[#F7F4EE]">
              ₹{formattedPrice}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-[9px] tracking-widest text-[#B89A62] uppercase font-medium opacity-80 group-hover:opacity-100">
            <span>EXPLORE</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Hover Gold Hairline Bottom Accent */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B89A62] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
      />
    </div>
  );
}
