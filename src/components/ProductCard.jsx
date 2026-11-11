import React, { useState } from 'react';
import { ArrowRight, ShoppingBag, Check, SlidersHorizontal } from 'lucide-react';
import PerfumeBottleVisual from './PerfumeBottleVisual';

export default function ProductCard({
  product,
  onSelectProduct,
  onAddToCart,
}) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  // Derive valid commercial prices strictly from backend variants or verified product fields
  let validPrices = [];
  if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    validPrices = product.variants
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p > 0);
  }
  if (validPrices.length === 0 && product?.minPrice !== undefined && product?.minPrice !== null && Number(product.minPrice) > 0) {
    validPrices.push(Number(product.minPrice));
  }
  if (validPrices.length === 0 && product?.price !== undefined && product?.price !== null && Number(product.price) > 0) {
    validPrices.push(Number(product.price));
  }

  const hasValidPrice = validPrices.length > 0;
  const startingPrice = hasValidPrice ? Math.min(...validPrices) : null;
  const maxPrice = hasValidPrice ? Math.max(...validPrices) : null;
  const hasPriceRange = hasValidPrice && startingPrice !== maxPrice;

  // Stock & Inventory Safety
  const activeVariants = (product?.variants || []).filter((v) => v.isActive !== false);
  let totalStock = null;
  if (activeVariants.length > 0) {
    totalStock = activeVariants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0);
  } else if (product?.stockQuantity !== undefined && product?.stockQuantity !== null) {
    totalStock = Number(product.stockQuantity);
  }

  const isSoldOut = totalStock !== null && totalStock <= 0;
  const hasMultipleVariants = activeVariants.length > 1;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isSoldOut || !hasValidPrice) return;

    // Safety rule: Never silently select an arbitrary size when multiple variants exist.
    if (hasMultipleVariants) {
      if (onSelectProduct) {
        onSelectProduct(product.id || product);
      }
      return;
    }

    if (onAddToCart) {
      const targetVariant = activeVariants.length === 1 ? activeVariants[0] : null;
      onAddToCart({
        ...product,
        variantId: targetVariant?.id,
        selectedVariant: targetVariant,
        selectedSize: targetVariant?.sizeLabel || (targetVariant?.sizeMl ? `${targetVariant.sizeMl} ML` : 'Flacon'),
        price: targetVariant ? Number(targetVariant.price) : startingPrice,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  // Badges: display ONLY when explicitly indicated by backend/CMS
  const badge = product?.badge ||
    (product?.isBestseller ? 'BESTSELLER' : product?.isNewArrival ? 'NEW ARRIVAL' : null);

  const inspiredBy = product?.inspiredByName || product?.brand;
  const referenceHouse = product?.referenceBrand?.name || product?.brand;

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
          <span className="font-interface-sans text-[8px] md:text-[9px] font-semibold tracking-[0.25em] text-[#D8BE82] border border-[#D8BE82]/40 px-2 py-0.5 rounded-xs uppercase bg-[#080A0B]/90">
            {badge}
          </span>
        ) : (
          <span className="text-[8px] tracking-[0.25em] text-[#D8D0C3]/80 uppercase">
            EXTRAIT DE PARFUM
          </span>
        )}
        <span className="text-[9px] tracking-[0.2em] text-[#D8D0C3]/60 font-mono">
          {product?.gender || 'UNISEX'}
        </span>
      </div>

      {/* Centerpiece Bottle Image Container */}
      <div className="relative h-64 md:h-72 w-full flex items-center justify-center my-4 overflow-hidden">
        {/* Soft Radial Ambient Aura */}
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundColor: product?.accentGlow || 'rgba(184, 154, 98, 0.12)',
            opacity: hovered ? 0.6 : 0.2,
          }}
        />

        {/* Studio Bottle Visual */}
        <div className="relative z-10 transition-transform duration-700 ease-out transform group-hover:scale-105">
          {product?.image ? (
            <img
              src={product.image}
              alt={product.name || 'İLLURÊ Fragrance'}
              onError={(e) => {
                e.currentTarget.src = '/images/illure-placeholder.svg';
              }}
              className="max-h-56 md:max-h-60 w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter brightness-[1.04]"
            />
          ) : (
            <PerfumeBottleVisual
              liquidColor={product?.liquidColor || "#3B2314"}
              accentGlow={product?.accentGlow}
              brandName={inspiredBy}
              perfumeName={product?.name}
              concentration={product?.concentration || 'Concentrated Parfum'}
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
                if (onSelectProduct) onSelectProduct(product.id || product);
              }}
              className="flex-1 py-2 px-3 bg-[#18181B] hover:bg-[#27272A] border border-white/[0.1] text-[#F7F4EE] text-[9px] tracking-[0.25em] uppercase font-medium transition-colors"
            >
              VIEW FRAGRANCE
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={isSoldOut || !hasValidPrice}
              className={`py-2 px-3 border text-[9px] tracking-[0.2em] uppercase font-semibold transition-all ${
                isSoldOut
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-[#B89A62] text-[#0B0B0C] border-[#B89A62]/40 hover:bg-[#C0A46D]'
              }`}
              title={
                isSoldOut
                  ? 'Out of Stock'
                  : hasMultipleVariants
                  ? 'Select Size'
                  : 'Add to Bag'
              }
            >
              {isSoldOut ? (
                <span className="text-[8px]">SOLD OUT</span>
              ) : added ? (
                <Check className="w-3.5 h-3.5" />
              ) : hasMultipleVariants ? (
                <SlidersHorizontal className="w-3.5 h-3.5" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Editorial Information */}
      <div className="space-y-3 z-10">
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#D8D0C3] tracking-wider uppercase mb-1">
            <span>{referenceHouse || 'İLLURÊ'}</span>
            <span className="font-mono text-[#D8BE82] font-medium">
              {product?.variants?.length ? `${product.variants.length} SIZES` : 'EXTRAIT'}
            </span>
          </div>

          <h3 className="font-editorial-serif text-xl md:text-2xl text-[#F7F3EA] group-hover:text-[#D8BE82] transition-colors leading-snug">
            {product?.name}
          </h3>

          <p className="text-[11px] text-[#D8D0C3] font-light line-clamp-1 mt-0.5">
            Inspired by {inspiredBy}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#D8BE82]/15 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1.5">
            {hasValidPrice ? (
              <>
                {hasPriceRange && (
                  <span className="text-[9px] tracking-wider text-[#D8D0C3] uppercase">FROM</span>
                )}
                <span className="font-mono text-xs md:text-sm font-semibold text-[#D8BE82]">
                  ₹{startingPrice.toLocaleString('en-IN')}
                  {hasPriceRange && ` – ₹${maxPrice.toLocaleString('en-IN')}`}
                </span>
              </>
            ) : (
              <span className="font-interface-sans text-[10px] tracking-widest text-[#D8D0C3] uppercase">
                PRICE UNAVAILABLE
              </span>
            )}
          </div>

          <span className="inline-flex items-center space-x-1 text-[9px] font-semibold tracking-widest text-[#D8BE82] uppercase group-hover:translate-x-1 transition-transform">
            <span>SELECT</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {/* Active Gold Line Indicator on Card Base */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B89A62]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}

