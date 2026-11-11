import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, ArrowLeft, Check, Sparkles, ShieldCheck, Gift, Clock, Wind, Flame, Sun, Droplets } from 'lucide-react';
import IllureCrest from './IllureCrest';
import ProductCard from './ProductCard';
import { giftPackagingApi } from '../api/giftPackaging';

export default function ProductDetailPage({ 
  productId, 
  productsData = [], 
  onBack, 
  onAddToCart, 
  onSelectProduct 
}) {
  const product = useMemo(() => {
    return productsData.find(p => p.id === productId || p.slug === productId) || productsData[0] || {};
  }, [productId, productsData]);

  // Derive sizes STRICTLY from live backend variants or product data
  const availableSizes = useMemo(() => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants
        .filter(v => v.isActive !== false)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map(v => {
          const vPrice = Number(v.price);
          const vStock = v.stockQuantity !== undefined && v.stockQuantity !== null ? Number(v.stockQuantity) : null;
          return {
            variantId: v.id,
            size: v.sizeLabel || (v.sizeMl ? `${v.sizeMl} ML` : 'Flacon'),
            price: !isNaN(vPrice) && vPrice > 0 ? vPrice : null,
            stock: vStock,
            inStock: vStock === null || vStock > 0,
            isLowStock: vStock !== null && vStock <= (v.lowStockThreshold ?? 5) && vStock > 0,
          };
        });
    }
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.map(s => {
        const sPrice = Number(s.price || product.minPrice || product.price || 0);
        const sStock = s.stock !== undefined && s.stock !== null ? Number(s.stock) : null;
        if (typeof s === 'string') {
          return {
            variantId: product.id,
            size: s,
            price: sPrice > 0 ? sPrice : null,
            stock: sStock,
            inStock: sStock === null || sStock > 0,
            isLowStock: sStock !== null && sStock <= 5 && sStock > 0,
          };
        }
        return {
          variantId: s.id || s.variantId || product.id,
          size: s.size || (s.sizeMl ? `${s.sizeMl} ML` : (s.sizeLabel || 'Flacon')),
          price: sPrice > 0 ? sPrice : null,
          stock: sStock,
          inStock: sStock === null || sStock > 0,
          isLowStock: sStock !== null && sStock <= 5 && sStock > 0,
        };
      });
    }
    // Single variant representation if no array defined on product
    const validRawPrice = (product.minPrice && Number(product.minPrice) > 0) 
      ? Number(product.minPrice) 
      : ((product.price && Number(product.price) > 0) ? Number(product.price) : null);
    const prodStock = product.stockQuantity !== undefined && product.stockQuantity !== null ? Number(product.stockQuantity) : null;
    return [{
      variantId: product.id || 'default-variant',
      size: product.size || (product.sizeMl ? `${product.sizeMl} ML` : 'Flacon'),
      price: validRawPrice,
      stock: prodStock,
      inStock: prodStock === null || prodStock > 0,
      isLowStock: prodStock !== null && prodStock <= 5 && prodStock > 0,
    }];
  }, [product]);

  const [selectedSizeObj, setSelectedSizeObj] = useState(availableSizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [giftBoxSelected, setGiftBoxSelected] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [added, setAdded] = useState(false);

  // Dynamic gift packaging from backend
  const [giftOption, setGiftOption] = useState(null);

  useEffect(() => {
    giftPackagingApi.getPublic()
      .then(res => {
        const pkgs = res?.data?.giftPackaging;
        if (pkgs && Array.isArray(pkgs)) {
          const activePkg = pkgs.find(p => p.isActive === true);
          if (activePkg) {
            setGiftOption({
              id: activePkg.id,
              name: activePkg.name,
              price: activePkg.price !== undefined && activePkg.price !== null ? Number(activePkg.price) : 0,
              description: activePkg.description || 'Luxury gift presentation with signature silk ribbon',
            });
          } else {
            setGiftOption(null);
          }
        }
      })
      .catch(() => {
        setGiftOption(null);
      });
  }, []);

  // Update selected size when product changes
  useEffect(() => {
    if (availableSizes && availableSizes.length > 0) {
      setSelectedSizeObj(availableSizes[0]);
    }
    setActiveImageIdx(0);
  }, [product, availableSizes]);

  const productImages = useMemo(() => {
    const list = [];
    if (product.primaryImage?.url) list.push(product.primaryImage.url);
    if (product.image && !list.includes(product.image)) list.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        const u = typeof img === 'string' ? img : img.url;
        if (u && !list.includes(u)) list.push(u);
      });
    }
    if (list.length === 0) list.push('/images/illure-placeholder.svg');
    return list;
  }, [product]);

  const hasValidPrice = selectedSizeObj && selectedSizeObj.price !== null && selectedSizeObj.price !== undefined && Number(selectedSizeObj.price) > 0;
  const currentPrice = hasValidPrice ? Number(selectedSizeObj.price) : 0;
  const packagingFee = (giftBoxSelected && giftOption) ? Number(giftOption.price || 0) : 0;
  const finalUnitPrice = hasValidPrice ? (currentPrice + packagingFee) : 0;
  const totalBatchPrice = hasValidPrice ? (finalUnitPrice * quantity) : null;
  const isAvailable = selectedSizeObj?.inStock !== false && hasValidPrice;

  const handleAdd = () => {
    if (onAddToCart && selectedSizeObj) {
      onAddToCart({
        ...product,
        variantId: selectedSizeObj.variantId,
        selectedSize: selectedSizeObj.size,
        price: selectedSizeObj.price,
        quantity,
        giftPackagingId: giftBoxSelected ? giftOption.id : null,
        giftPackaging: giftBoxSelected ? { id: giftOption.id, name: giftOption.name, price: giftOption.price, message: giftMessage } : null,
        giftMessage: giftBoxSelected ? giftMessage : null,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    }
  };

  // Recommended companions
  const recommended = productsData
    .filter(p => p.id !== product.id && p.slug !== product.slug)
    .slice(0, 3);

  // Fragrance Notes extraction
  const topNotes = Array.isArray(product.topNotes) ? product.topNotes : (product.topNotes ? [product.topNotes] : null);
  const heartNotes = Array.isArray(product.heartNotes) ? product.heartNotes : (product.heartNotes ? [product.heartNotes] : null);
  const baseNotes = Array.isArray(product.baseNotes) ? product.baseNotes : (product.baseNotes ? [product.baseNotes] : null);
  const hasPyramidNotes = Boolean(topNotes?.length || heartNotes?.length || baseNotes?.length);

  return (
    <div className="min-h-screen bg-[#0B0B0C] pt-28 pb-32 text-[#F7F4EE] select-none">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-white/[0.04]">
          <button 
            onClick={onBack}
            className="group inline-flex items-center space-x-2 text-xs font-interface-sans tracking-[0.25em] text-[#A1A1AA] hover:text-[#F7F4EE] transition-colors uppercase"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            <span>ALL FRAGRANCES</span>
          </button>

          <div className="flex items-center space-x-2 text-[10px] tracking-widest text-[#B89A62] uppercase font-mono hidden sm:flex">
            <IllureCrest size={14} className="text-[#B89A62]" />
            <span>İLLURÊ FRAGRANCE</span>
          </div>
        </div>

        {/* MAIN HERO GRID: GALLERY (LEFT) + INFO (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-20 border-b border-white/[0.06]">
          
          {/* LEFT: GALLERY & IMMERSIVE BOTTLE PRESENTATION */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative h-[480px] sm:h-[620px] w-full bg-[#121214] border border-[#B89A62]/20 rounded-xs flex items-center justify-center p-8 overflow-hidden group">
              
              {/* Radial backlight aura */}
              <div className="absolute inset-0 bg-radial from-[#B89A62]/12 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

              <img 
                src={productImages[activeImageIdx] || '/images/illure-placeholder.svg'} 
                onError={(e) => { e.currentTarget.src = "/images/illure-placeholder.svg"; }}
                alt={product.name || 'İLLURÊ Fragrance'} 
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)] transition-transform duration-700 group-hover:scale-105"
              />

              {/* Formulation Tag */}
              <div className="absolute top-6 left-6 flex items-center space-x-2 bg-[#0B0B0C]/85 backdrop-blur-md border border-[#B89A62]/30 px-3 py-1.5 text-[9px] tracking-[0.25em] text-[#B89A62] uppercase font-medium">
                <Sparkles className="w-3 h-3 text-[#B89A62]" />
                <span>EXTRAIT DE PARFUM</span>
              </div>

              {/* Watermark Crest */}
              <div className="absolute bottom-6 right-6 opacity-25">
                <IllureCrest size={32} className="text-[#B89A62]" />
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {productImages.length > 1 && (
              <div className="flex items-center space-x-4">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-20 h-20 bg-[#121214] border p-2 rounded-xs overflow-hidden transition-all ${
                      activeImageIdx === idx 
                        ? 'border-[#B89A62] shadow-[0_0_15px_rgba(184,154,98,0.2)]' 
                        : 'border-white/[0.08] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      onError={(e) => { e.currentTarget.src = "/images/illure-placeholder.svg"; }} 
                      alt="" 
                      className="w-full h-full object-contain" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: EDITORIAL DETAILS, SIZES, GIFTING, BUY */}
          <div className="lg:col-span-5 space-y-7">
            
            {/* Identity & Headline */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-[1px] bg-[#B89A62]" />
                <span className="typography-eyebrow text-[#B89A62]">
                  {product.gender || 'UNISEX'} · EXTRAIT DE PARFUM
                </span>
              </div>

              <h1 className="typography-display text-[#F7F4EE]">
                {product.name}
              </h1>

              {(product.inspiredByName || product.brand || product.referenceBrand) && (
                <p className="typography-body text-xs md:text-sm text-[#A1A1AA]">
                  Inspired by <span className="text-[#E3DCD0] font-normal">{product.inspiredByName || product.brand}</span>
                  {product.referenceBrand && ` · Reference House: ${product.referenceBrand.name || product.referenceBrand}`}
                </p>
              )}
            </div>

            {/* Dynamic Price Display */}
            <div className="pt-2 flex items-baseline space-x-3 border-y border-white/[0.06] py-4">
              {hasValidPrice ? (
                <>
                  <span className="font-editorial-serif text-3xl md:text-4xl font-light text-[#F7F4EE]">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] tracking-widest text-[#A1A1AA] uppercase">
                    INCL. ALL TAXES
                  </span>
                </>
              ) : (
                <span className="font-interface-sans text-xs tracking-widest text-[#A1A1AA] uppercase">
                  PRICE UNAVAILABLE
                </span>
              )}
            </div>

            {/* SIZE SELECTOR: LUXURY EDITORIAL TILES */}
            {availableSizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs tracking-widest uppercase">
                  <span className="font-medium text-[#F7F4EE]">SELECT BOTTLE SIZE</span>
                  {selectedSizeObj && (
                    <span className="text-[#B89A62] text-[10px]">
                      {selectedSizeObj.isLowStock 
                        ? `ONLY ${selectedSizeObj.stock} LEFT` 
                        : (selectedSizeObj.inStock ? 'IN STOCK' : 'OUT OF STOCK')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSizes.map((sObj, idx) => {
                    const isSelected = selectedSizeObj?.size === sObj.size;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSizeObj(sObj)}
                        className={`p-3 text-center border rounded-xs transition-all flex flex-col justify-between items-center ${
                          isSelected
                            ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE] shadow-[0_0_15px_rgba(184,154,98,0.15)] ring-1 ring-[#B89A62]'
                            : 'border-white/[0.08] bg-[#121214] text-[#A1A1AA] hover:border-[#B89A62]/40'
                        }`}
                      >
                        <span className="font-interface-sans text-xs font-semibold tracking-wider">
                          {sObj.size}
                        </span>
                        <span className="text-[11px] font-mono mt-1 text-[#B89A62]">
                          {sObj.price ? `₹${sObj.price.toLocaleString('en-IN')}` : '—'}
                        </span>
                        {sObj.isLowStock && (
                          <span className="text-[8px] text-amber-400 mt-1 uppercase">
                            LOW STOCK
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GIFT PACKAGING PRESENTATION UI */}
            {giftOption && giftOption.id && (
              <div className="p-4 bg-[#121214] border border-[#B89A62]/20 rounded-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Gift className="w-4 h-4 text-[#B89A62]" />
                    <div>
                      <span className="text-xs font-medium text-[#F7F4EE] block tracking-wider uppercase">
                        {giftOption.name}
                      </span>
                      <span className="text-[11px] text-[#A1A1AA]">
                        {giftOption.description} {giftOption.price > 0 ? `(+₹${giftOption.price.toLocaleString('en-IN')})` : '(Complimentary)'}
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    id="giftBoxToggle"
                    checked={giftBoxSelected}
                    onChange={(e) => setGiftBoxSelected(e.target.checked)}
                    className="w-4 h-4 accent-[#B89A62] cursor-pointer mt-1"
                  />
                </div>

                {giftBoxSelected && (
                  <div className="pt-2 animate-fade-up">
                    <label className="text-[10px] tracking-widest text-[#B89A62] uppercase block mb-1">
                      PERSONALIZED CALLIGRAPHED GIFT MESSAGE
                    </label>
                    <textarea
                      rows={2}
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Write your personal note to accompany this flacon..."
                      className="w-full bg-[#0B0B0C] border border-[#B89A62]/30 p-2.5 text-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* QUANTITY & ADD TO BAG */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                
                {/* Quantity */}
                <div className="flex items-center border border-white/[0.1] bg-[#121214] rounded-xs px-3 py-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#A1A1AA] hover:text-[#F7F4EE] px-2 text-sm"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs px-3 text-[#F7F4EE]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#A1A1AA] hover:text-[#F7F4EE] px-2 text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAdd}
                  disabled={!isAvailable}
                  className={`flex-1 py-4 px-6 text-xs tracking-[0.25em] font-semibold uppercase transition-all duration-300 flex items-center justify-center space-x-2.5 rounded-xs shadow-[0_10px_30px_rgba(184,154,98,0.2)] ${
                    !isAvailable
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#B89A62] hover:bg-[#C0A46D] text-[#0B0B0C]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {!hasValidPrice
                      ? 'PRICE UNAVAILABLE'
                      : !selectedSizeObj?.inStock
                      ? 'OUT OF STOCK'
                      : added
                      ? 'ADDED TO BAG'
                      : `ADD TO BAG · ₹${totalBatchPrice.toLocaleString('en-IN')}`}
                  </span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[10px] tracking-wider text-[#A1A1AA] uppercase pt-2 border-t border-white/[0.04]">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B89A62]" />
                  <span>Concentrated Extrait · İLLURÊ</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B89A62]" />
                  <span>Tamper-Sealed Dispatch</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* FRAGRANCE PYRAMID (TOP, HEART, BASE) */}
        {hasPyramidNotes && (
          <div className="py-20 border-b border-white/[0.06] space-y-12">
            <div className="text-center space-y-2">
              <span className="typography-eyebrow text-[#B89A62]">
                THE NOTES
              </span>
              <h3 className="typography-h1 text-[#F7F4EE]">
                FRAGRANCE PYRAMID
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topNotes && topNotes.length > 0 && (
                <div className="p-8 bg-[#121214] border border-[#B89A62]/20 rounded-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="typography-eyebrow text-[9px] text-[#B89A62]">
                      STAGE I · FIRST 30 MINUTES
                    </span>
                    <Wind className="w-4 h-4 text-[#B89A62]" />
                  </div>
                  <h4 className="font-editorial-serif text-2xl text-[#F7F4EE]">
                    TOP NOTES
                  </h4>
                  <ul className="space-y-2 text-xs text-[#A1A1AA] font-light">
                    {topNotes.map((n, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B89A62]" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {heartNotes && heartNotes.length > 0 && (
                <div className="p-8 bg-[#121214] border border-[#B89A62]/30 rounded-xs space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between">
                    <span className="typography-eyebrow text-[9px] text-[#B89A62]">
                      STAGE II · 2 TO 6 HOURS
                    </span>
                    <Droplets className="w-4 h-4 text-[#B89A62]" />
                  </div>
                  <h4 className="font-editorial-serif text-2xl text-[#F7F4EE]">
                    HEART NOTES
                  </h4>
                  <ul className="space-y-2 text-xs text-[#A1A1AA] font-light">
                    {heartNotes.map((n, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B89A62]" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {baseNotes && baseNotes.length > 0 && (
                <div className="p-8 bg-[#121214] border border-[#B89A62]/20 rounded-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="typography-eyebrow text-[9px] text-[#B89A62]">
                      STAGE III · 8 TO 14+ HOURS
                    </span>
                    <Flame className="w-4 h-4 text-[#B89A62]" />
                  </div>
                  <h4 className="font-editorial-serif text-2xl text-[#F7F4EE]">
                    BASE NOTES
                  </h4>
                  <ul className="space-y-2 text-xs text-[#A1A1AA] font-light">
                    {baseNotes.map((n, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B89A62]" />
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PERFORMANCE DYNAMICS & OCCASION */}
        {(product.longevity || product.projection || product.occasion || product.season) && (
          <div className="py-20 border-b border-white/[0.06] space-y-12">
            <div className="text-center space-y-2">
              <span className="typography-eyebrow text-[#B89A62]">
                PERFORMANCE & WEAR
              </span>
              <h3 className="typography-h1 text-[#F7F4EE]">
                HOW IT WEARS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.longevity && (
                <div className="p-5 bg-[#121214] border border-white/[0.06] rounded-xs space-y-1">
                  <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                    LONGEVITY ON SKIN
                  </span>
                  <p className="font-editorial-serif text-xl text-[#F7F4EE]">
                    {product.longevity}
                  </p>
                </div>
              )}

              {product.projection && (
                <div className="p-5 bg-[#121214] border border-white/[0.06] rounded-xs space-y-1">
                  <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                    SILLAGE & PROJECTION
                  </span>
                  <p className="font-editorial-serif text-xl text-[#F7F4EE]">
                    {product.projection}
                  </p>
                </div>
              )}

              {product.occasion && (
                <div className="p-5 bg-[#121214] border border-white/[0.06] rounded-xs space-y-1">
                  <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                    RECOMMENDED OCCASION
                  </span>
                  <p className="font-editorial-serif text-xl text-[#F7F4EE]">
                    {product.occasion}
                  </p>
                </div>
              )}

              {product.season && (
                <div className="p-5 bg-[#121214] border border-white/[0.06] rounded-xs space-y-1">
                  <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                    OPTIMAL SEASON
                  </span>
                  <p className="font-editorial-serif text-xl text-[#F7F4EE]">
                    {product.season}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMPANION RECOMMENDATIONS */}
        {recommended.length > 0 && (
          <div className="pt-20 space-y-10">
            <div className="text-center space-y-2">
              <span className="typography-eyebrow text-[#B89A62]">
                MORE TO WEAR
              </span>
              <h3 className="typography-h1 text-[#F7F4EE]">
                YOU MIGHT ALSO LIKE
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommended.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* STICKY MOBILE ADD TO BAG BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0C]/95 backdrop-blur-xl border-t border-[#B89A62]/30 p-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.9)]">
        <div>
          <span className="text-[10px] text-[#B89A62] uppercase tracking-wider block font-semibold truncate max-w-[180px]">
            {selectedSizeObj?.size} · {product.name}
          </span>
          <span className="font-editorial-serif text-xl text-[#F7F4EE]">
            {hasValidPrice ? `₹${totalBatchPrice.toLocaleString('en-IN')}` : 'Unavailable'}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={!isAvailable}
          className={`px-6 py-3 text-xs tracking-widest font-semibold uppercase rounded-xs transition-colors ${
            !isAvailable
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : added
              ? 'bg-emerald-600 text-white'
              : 'bg-[#B89A62] text-[#0B0B0C]'
          }`}
        >
          {!hasValidPrice ? 'UNAVAILABLE' : !selectedSizeObj?.inStock ? 'OUT OF STOCK' : added ? 'ADDED' : 'ADD TO BAG'}
        </button>
      </div>

    </div>
  );
}
