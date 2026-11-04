import React, { useState } from 'react';
import { ShoppingBag, ArrowLeft, Check, Sparkles, ShieldCheck, Gift, Clock, Wind, Flame, Sun, Droplets } from 'lucide-react';
import IllureCrest from './IllureCrest';
import ProductCard from './ProductCard';

export default function ProductDetailPage({ 
  productId = 'tf-oud-wood', 
  productsData = [], 
  onBack, 
  onAddToCart, 
  onSelectProduct 
}) {
  const product = productsData.find(p => p.id === productId) || productsData[0] || {
    id: 'tf-oud-wood',
    name: 'Oud Wood Extrait',
    brand: 'TOM FORD',
    inspiredByName: 'Tom Ford Oud Wood',
    price: 21500,
    sizes: [
      { size: '3 ML', price: 950, stock: 24 },
      { size: '6 ML', price: 1650, stock: 12 },
      { size: '12 ML', price: 2950, stock: 5 },
      { size: '50 ML', price: 11500, stock: 8 },
      { size: '100 ML', price: 21500, stock: 15 },
    ],
    image: '/images/oud_wood.jpg',
    description: 'A masterpiece of smoky resin and rare woods. Exotic rosewood and cardamom introduce an intoxicating blend of precious oud, sandalwood, and vetiver, enriched by warm amber and tonka bean.',
    topNotes: ['Rosewood', 'Cardamom', 'Chinese Pepper'],
    heartNotes: ['Rare Oud Wood', 'Sandalwood', 'Vetiver Root'],
    baseNotes: ['Amber Crystal', 'Tonka Bean', 'Pure Vanilla'],
    concentration: 'Extrait de Parfum (35% Concentration)',
    longevity: '14+ Hours',
    projection: 'Commanding Sillage',
    gender: 'UNISEX',
  };

  const defaultSizes = product.sizes && product.sizes.length > 0 
    ? product.sizes 
    : [
        { size: '3 ML', price: 950, stock: 20 },
        { size: '6 ML', price: 1650, stock: 15 },
        { size: '12 ML', price: 2950, stock: 4 },
        { size: '50 ML', price: 11500, stock: 10 },
        { size: '100 ML', price: product.price || 21500, stock: 8 },
      ];

  const [selectedSizeObj, setSelectedSizeObj] = useState(defaultSizes[1] || defaultSizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [giftBoxSelected, setGiftBoxSelected] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const productImages = [
    product.image || "/images/oud_wood.jpg",
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000"
  ];

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        ...product,
        selectedSize: selectedSizeObj.size,
        price: selectedSizeObj.price,
        quantity,
        giftPackaging: giftBoxSelected ? { name: 'Royal Velvet Gift Box', price: 350, message: giftMessage } : null,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    }
  };

  const finalUnitPrice = selectedSizeObj.price + (giftBoxSelected ? 350 : 0);
  const totalBatchPrice = finalUnitPrice * quantity;

  // Recommended companions
  const recommended = productsData
    .filter(p => p.id !== product.id)
    .slice(0, 3);

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
            <span>RETURN TO COLLECTION</span>
          </button>

          <div className="flex items-center space-x-2 text-[10px] tracking-widest text-[#B89A62] uppercase font-mono hidden sm:flex">
            <IllureCrest size={14} className="text-[#B89A62]" />
            <span>İLLURÊ MAISON ARCHIVE</span>
          </div>
        </div>

        {/* ==================================================
            DESKTOP MAIN HERO GRID: GALLERY (LEFT) + INFO (RIGHT)
            ================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-20 border-b border-white/[0.06]">
          
          {/* LEFT: GALLERY & IMMERSIVE BOTTLE PRESENTATION */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative h-[480px] sm:h-[620px] w-full bg-[#121214] border border-[#B89A62]/20 rounded-xs flex items-center justify-center p-8 overflow-hidden group">
              
              {/* Radial backlight aura */}
              <div className="absolute inset-0 bg-radial from-[#B89A62]/12 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

              <img 
                src={productImages[activeImageIdx]} 
                onError={(e) => { e.target.src = "/images/oud_wood.jpg"; }}
                alt={product.name} 
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)] transition-transform duration-700 group-hover:scale-105"
              />

              {/* Formulation Tag */}
              <div className="absolute top-6 left-6 flex items-center space-x-2 bg-[#0B0B0C]/85 backdrop-blur-md border border-[#B89A62]/30 px-3 py-1.5 text-[9px] tracking-[0.25em] text-[#B89A62] uppercase font-medium">
                <Sparkles className="w-3 h-3 text-[#B89A62]" />
                <span>EXTRAIT FORMULATION</span>
              </div>

              {/* Watermark Crest */}
              <div className="absolute bottom-6 right-6 opacity-25">
                <IllureCrest size={32} className="text-[#B89A62]" />
              </div>
            </div>

            {/* Thumbnail Navigation */}
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
                    onError={(e) => { e.target.src = "/images/oud_wood.jpg"; }} 
                    alt="" 
                    className="w-full h-full object-contain" 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: EDITORIAL DETAILS, SIZES, GIFTING, BUY */}
          <div className="lg:col-span-5 space-y-7">
            
            {/* Identity & Headline */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="w-6 h-[1px] bg-[#B89A62]" />
                <span className="typography-eyebrow text-[#B89A62]">
                  {product.gender || 'UNISEX'} · HAUTE PARFUMERIE
                </span>
              </div>

              <h1 className="typography-display text-[#F7F4EE]">
                {product.name}
              </h1>

              <p className="typography-body text-xs md:text-sm text-[#A1A1AA]">
                Inspired by <span className="text-[#E3DCD0] font-normal">{product.inspiredByName || product.brand}</span>
                {product.referenceBrand && ` · Reference House: ${product.referenceBrand.name}`}
              </p>
            </div>

            {/* Dynamic Price Display */}
            <div className="pt-2 flex items-baseline space-x-3 border-y border-white/[0.06] py-4">
              <span className="font-editorial-serif text-3xl md:text-4xl font-light text-[#F7F4EE]">
                ₹{selectedSizeObj.price.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] tracking-widest text-[#A1A1AA] uppercase">
                INCL. ALL TAXES & FREE SHIPPING
              </span>
            </div>

            {/* SIZE SELECTOR: LUXURY EDITORIAL TILES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs tracking-widest uppercase">
                <span className="font-medium text-[#F7F4EE]">BOTTLE SIZE</span>
                <span className="text-[#B89A62] text-[10px]">
                  {selectedSizeObj.stock <= 5 ? `ONLY ${selectedSizeObj.stock} LEFT` : 'IN STOCK'}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {defaultSizes.map((sObj, idx) => {
                  const isSelected = selectedSizeObj.size === sObj.size;
                  const isLow = sObj.stock <= 5;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSizeObj(sObj)}
                      className={`p-3 text-center border rounded-xs transition-all flex flex-col justify-between items-center ${
                        isSelected
                          ? 'border-[#B89A62] bg-[#18181B] text-[#F7F4EE] shadow-[0_0_15px_rgba(184,154,98,0.15)]'
                          : 'border-white/[0.08] bg-[#121214] text-[#A1A1AA] hover:border-[#B89A62]/40'
                      }`}
                    >
                      <span className="font-interface-sans text-xs font-semibold tracking-wider">
                        {sObj.size}
                      </span>
                      <span className="text-[10px] font-mono mt-1 text-[#B89A62]">
                        ₹{sObj.price.toLocaleString('en-IN')}
                      </span>
                      {isLow && (
                        <span className="text-[8px] text-amber-400 mt-1 uppercase">
                          LOW
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GIFT PACKAGING PRESENTATION UI */}
            <div className="p-4 bg-[#121214] border border-[#B89A62]/20 rounded-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <Gift className="w-4 h-4 text-[#B89A62]" />
                  <div>
                    <span className="text-xs font-medium text-[#F7F4EE] block tracking-wider uppercase">
                      ROYAL VELVET GIFT PRESENTATION
                    </span>
                    <span className="text-[11px] text-[#A1A1AA]">
                      Gold-embossed rigid box with satin lining & personal calligraphed card (+₹350)
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
                    PERSONALIZED GIFT MESSAGE
                  </label>
                  <textarea
                    rows={2}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Write your personal message to accompany this flacon..."
                    className="w-full bg-[#0B0B0C] border border-[#B89A62]/30 p-2.5 text-xs text-[#F7F4EE] focus:outline-none focus:border-[#B89A62]"
                  />
                </div>
              )}
            </div>

            {/* QUANTITY & ADD TO BAG */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-4">
                {/* Quantity Control */}
                <div className="flex items-center border border-white/[0.1] bg-[#121214] rounded-xs px-3 py-3 space-x-4 text-xs font-mono">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="text-[#A1A1AA] hover:text-[#F7F4EE] px-1 text-sm"
                  >
                    –
                  </button>
                  <span className="text-[#F7F4EE] font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="text-[#A1A1AA] hover:text-[#F7F4EE] px-1 text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Bag Button */}
                <button
                  onClick={handleAdd}
                  className={`flex-1 py-4 px-8 text-xs tracking-[0.28em] font-semibold uppercase transition-all duration-300 flex items-center justify-center space-x-3 rounded-xs ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#B89A62] hover:bg-[#C0A46D] text-[#0B0B0C] shadow-[0_10px_25px_rgba(184,154,98,0.2)]'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ADDED TO BAG</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO BAG · ₹{totalBatchPrice.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-2 flex items-center space-x-3 text-[11px] text-[#A1A1AA] font-interface-sans tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#B89A62] shrink-0" />
                <span>Tamper-sealed flacons · Inspected & prepared by hand</span>
              </div>
            </div>

          </div>

        </div>

        {/* ==================================================
            PRODUCT STORY SECTION
            ================================================== */}
        <div className="py-20 border-b border-white/[0.06] grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-4 space-y-2">
            <span className="typography-eyebrow text-[#B89A62]">
              THE STORY & INSPIRATION
            </span>
            <h3 className="typography-h2 text-[#F7F4EE]">
              SCENT PROFILE & EMOTION
            </h3>
          </div>

          <div className="md:col-span-8 space-y-4">
            <p className="typography-body-large text-[#A1A1AA]">
              {product.description}
            </p>
            <p className="typography-body text-[#A1A1AA] text-xs">
              Every drop is distilled at maximum concentration, allowing base resin molecules to bond intimately with your skin’s natural warmth.
            </p>
          </div>
        </div>

        {/* ==================================================
            FRAGRANCE NOTES VISUAL (TOP, HEART, BASE COLUMNS)
            ================================================== */}
        <div className="py-20 border-b border-white/[0.06] space-y-12">
          <div className="text-center space-y-2">
            <span className="typography-eyebrow text-[#B89A62]">
              OLFACTORY ARCHITECTURE
            </span>
            <h3 className="typography-h1 text-[#F7F4EE]">
              THE FRAGRANCE PYRAMID
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* TOP NOTES */}
            <div className="p-8 bg-[#121214] border-l-2 border-[#B89A62] space-y-4 rounded-xs">
              <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] text-[#B89A62] uppercase font-semibold">
                <Wind className="w-4 h-4" />
                <span>TOP NOTES · FIRST 30 MIN</span>
              </div>
              <ul className="space-y-2 font-editorial-serif text-2xl text-[#F7F4EE]">
                {(product.topNotes || ['Rosewood', 'Cardamom', 'Chinese Pepper']).map((note, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-[#B89A62] text-sm">✦</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#A1A1AA] font-light">
                Immediate sensory greeting, crisp and stimulating.
              </p>
            </div>

            {/* HEART NOTES */}
            <div className="p-8 bg-[#121214] border-l-2 border-[#B89A62] space-y-4 rounded-xs">
              <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] text-[#B89A62] uppercase font-semibold">
                <Droplets className="w-4 h-4" />
                <span>HEART NOTES · 2 TO 6 HOURS</span>
              </div>
              <ul className="space-y-2 font-editorial-serif text-2xl text-[#F7F4EE]">
                {(product.heartNotes || ['Rare Oud Wood', 'Sandalwood', 'Vetiver Root']).map((note, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-[#B89A62] text-sm">✦</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#A1A1AA] font-light">
                The signature character, unfolding depth and intrigue.
              </p>
            </div>

            {/* BASE NOTES */}
            <div className="p-8 bg-[#121214] border-l-2 border-[#B89A62] space-y-4 rounded-xs">
              <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] text-[#B89A62] uppercase font-semibold">
                <Flame className="w-4 h-4" />
                <span>BASE NOTES · 8 TO 16+ HOURS</span>
              </div>
              <ul className="space-y-2 font-editorial-serif text-2xl text-[#F7F4EE]">
                {(product.baseNotes || ['Amber Crystal', 'Tonka Bean', 'Pure Vanilla']).map((note, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <span className="text-[#B89A62] text-sm">✦</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#A1A1AA] font-light">
                The sensual trail that anchors into garments and memory.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            FRAGRANCE PROFILE & PERFORMANCE SPECS
            ================================================== */}
        <div className="py-20 border-b border-white/[0.06] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Performance Scales */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-1">
              <span className="typography-eyebrow text-[#B89A62]">
                INTENSITY MATRIX
              </span>
              <h3 className="typography-h2 text-[#F7F4EE]">
                SCENT DYNAMICS
              </h3>
            </div>

            <div className="space-y-5 text-xs tracking-wider">
              {/* Freshness / Warmth */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>FRESHNESS</span>
                  <span className="text-[#B89A62] font-mono">WARMTH (85%)</span>
                </div>
                <div className="h-1 bg-[#18181B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B89A62] rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              {/* Sillage / Projection */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>INTIMACY</span>
                  <span className="text-[#B89A62] font-mono">PROJECTION (90%)</span>
                </div>
                <div className="h-1 bg-[#18181B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B89A62] rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              {/* Longevity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>MODERATE</span>
                  <span className="text-[#B89A62] font-mono">LONGEVITY (95%)</span>
                </div>
                <div className="h-1 bg-[#18181B] rounded-full overflow-hidden">
                  <div className="h-full bg-[#B89A62] rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Practical Specifications */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-5 bg-[#121214] border border-white/[0.06] rounded-xs space-y-1">
              <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                CONCENTRATION
              </span>
              <p className="font-editorial-serif text-xl text-[#F7F4EE]">
                {product.concentration || 'Extrait de Parfum'}
              </p>
            </div>

            <div className="p-5 bg-[#121214] border border-white/[0.06] rounded-xs space-y-1">
              <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                LONGEVITY
              </span>
              <p className="font-editorial-serif text-xl text-[#F7F4EE]">
                {product.longevity || '14+ Hours'}
              </p>
            </div>

            <div className="p-5 bg-[#121214] border border-white/[0.06] rounded-xs space-y-1">
              <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                IDEAL OCCASION
              </span>
              <p className="font-editorial-serif text-xl text-[#F7F4EE]">
                {product.occasion || 'Evening & Signature'}
              </p>
            </div>

            <div className="p-5 bg-[#121214] border border-white/[0.06] rounded-xs space-y-1">
              <span className="text-[10px] tracking-widest text-[#B89A62] uppercase block">
                OPTIMAL SEASON
              </span>
              <p className="font-editorial-serif text-xl text-[#F7F4EE]">
                {product.season || 'Autumn, Winter & Nocturne'}
              </p>
            </div>
          </div>

        </div>

        {/* ==================================================
            COMPANION RECOMMENDATIONS
            ================================================== */}
        {recommended.length > 0 && (
          <div className="pt-20 space-y-10">
            <div className="text-center space-y-2">
              <span className="typography-eyebrow text-[#B89A62]">
                CURATED COMPANIONS
              </span>
              <h3 className="typography-h1 text-[#F7F4EE]">
                YOU MAY ALSO APPRECIATE
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

      {/* ==================================================
          STICKY MOBILE ADD TO BAG BAR (REQUIREMENT 45)
          ================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0C]/95 backdrop-blur-xl border-t border-[#B89A62]/30 p-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.9)]">
        <div>
          <span className="text-[10px] text-[#B89A62] uppercase tracking-wider block font-semibold">
            {selectedSizeObj.size} · {product.name}
          </span>
          <span className="font-editorial-serif text-xl text-[#F7F4EE]">
            ₹{totalBatchPrice.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`px-6 py-3 text-xs tracking-widest font-semibold uppercase rounded-xs transition-colors ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-[#B89A62] text-[#0B0B0C]'
          }`}
        >
          {added ? 'ADDED' : 'ADD TO BAG'}
        </button>
      </div>

    </div>
  );
}
