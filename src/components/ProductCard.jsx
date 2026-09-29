import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import PerfumeBottleVisual from './PerfumeBottleVisual';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  onAddToCart, 
  onToggleWishlist,
  isWishlisted = false
}) {
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  return (
    <div 
      className="group relative flex flex-col bg-[#101617] border border-white/[0.06] rounded-xs p-5 transition-all duration-500 hover:border-[#B89A62]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer"
      onClick={() => onSelectProduct(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top Header: Badge & Wishlist */}
      <div className="flex items-center justify-between z-10 mb-2">
        {product.badge ? (
          <span className="font-interface-sans text-[9px] font-bold tracking-[0.2em] px-2.5 py-1 bg-white/[0.04] border border-[#B89A62]/30 text-[#B89A62] uppercase rounded-xs">
            {product.badge}
          </span>
        ) : <span />}

        <button 
          onClick={handleWishlistClick}
          className={`p-2 rounded-full transition-all duration-300 ${
            isWishlisted 
              ? 'text-red-500 bg-white/10' 
              : 'text-[#8F9897] hover:text-[#F2EFE8] hover:bg-white/5'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image / Bottle Canvas Visual */}
      <div className="relative h-64 w-full flex items-center justify-center overflow-hidden my-3">
        {/* Soft Background Radial Glow on Hover */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none"
          style={{ 
            backgroundColor: product.accentGlow || 'rgba(184, 154, 98, 0.15)', 
            opacity: hovered ? 0.6 : 0.25 
          }}
        />

        <div className="transform group-hover:scale-105 transition-transform duration-500 ease-out z-10">
          <PerfumeBottleVisual 
            liquidColor={product.liquidColor || "#3B2314"}
            accentGlow={product.accentGlow}
            brandName={product.brand}
            perfumeName={product.name}
            concentration={product.concentration}
            height={220}
            interactive={false}
          />
        </div>

        {/* Hover Quick Action Overlay Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-gradient-to-t from-[#101617] via-[#101617]/90 to-transparent">
          <button 
            onClick={(e) => { e.stopPropagation(); onSelectProduct(product); }}
            className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-[#F2EFE8] font-interface-sans text-[10px] font-semibold tracking-widest uppercase rounded-xs flex items-center justify-center space-x-1 backdrop-blur-sm transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>VIEW</span>
          </button>
          
          <button 
            onClick={handleQuickAdd}
            className={`flex-1 py-2 px-3 font-interface-sans text-[10px] font-bold tracking-widest uppercase rounded-xs flex items-center justify-center space-x-1 transition-all ${
              added 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#B89A62] hover:bg-[#C0A46D] text-[#080C0D]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3" />
                <span>ADDED</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                <span>QUICK ADD</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="mt-auto pt-2 flex flex-col space-y-1 text-left">
        <span className="font-interface-sans text-[10px] tracking-[0.25em] text-[#8F9897] uppercase font-semibold">
          {product.brand}
        </span>
        
        <h4 className="font-editorial-serif text-xl text-[#F2EFE8] font-medium tracking-wide group-hover:text-[#B89A62] transition-colors line-clamp-1">
          {product.name}
        </h4>

        <p className="font-interface-sans text-xs text-[#8F9897]/80 tracking-wider">
          {product.concentration} · {product.sizes ? product.sizes[0].size : '100 ML'}
        </p>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-interface-sans text-base font-bold text-[#F2EFE8] tracking-wide">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && (
              <span className="font-interface-sans text-xs text-[#8F9897] line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          
          <span className="font-interface-sans text-xs text-[#B89A62] opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 font-semibold">
            <span>Discover</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </div>
  );
}
