import React, { useState } from 'react';
import { ShoppingBag, Heart, ArrowLeft, Check, Sparkles, ShieldCheck } from 'lucide-react';

export default function ProductDetailPage({ 
  productId = 'tf-oud-wood', 
  productsData, 
  onBack, 
  onAddToCart, 
  onSelectProduct 
}) {
  // Find current product or default to Tom Ford Oud Wood
  const product = productsData.find(p => p.id === productId) || productsData[0];

  const [selectedSize, setSelectedSize] = useState(
    product.sizes ? product.sizes[1]?.size || product.sizes[0]?.size : '100 ML'
  );
  
  const [selectedPrice, setSelectedPrice] = useState(
    product.sizes ? product.sizes[1]?.price || product.price : product.price
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const handleSizeChange = (sizeObj) => {
    setSelectedSize(sizeObj.size);
    setSelectedPrice(sizeObj.price);
  };

  const handleAdd = () => {
    onAddToCart({
      ...product,
      selectedSize,
      price: selectedPrice
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  // 3 Recommended Fragrances excluding current
  const recommended = productsData
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  // Fallback images if product image array missing
  const productImages = [
    product.image || "/images/oud_wood.jpg",
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000"
  ];

  return (
    <div className="min-h-screen bg-[#080C0D] pt-28 pb-24 text-[#F2EFE8] select-none">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* BACK NAVIGATION */}
        <button 
          onClick={onBack}
          className="group inline-flex items-center space-x-2 text-xs font-interface-sans tracking-[0.2em] text-[#8F9897] hover:text-[#F2EFE8] transition-colors mb-12 uppercase"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO COLLECTION</span>
        </button>

        {/* TOP SECTION: IMAGE + MAIN SPECS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-24 border-b border-white/[0.08]">
          
          {/* LEFT: LARGE PERFUME IMAGE & GALLERY */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative h-[480px] sm:h-[600px] w-full bg-[#101617] border border-white/[0.08] rounded-xs flex items-center justify-center p-8 overflow-hidden">
              
              <div className="absolute inset-0 bg-radial from-[#B89A62]/10 via-transparent to-transparent opacity-50" />

              <img 
                src={productImages[activeImageIdx]} 
                onError={(e) => { e.target.src = "/images/oud_wood.jpg"; }}
                alt={product.name} 
                className="max-h-full w-auto object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)] transition-transform duration-500 hover:scale-105"
              />

              <span className="absolute top-6 left-6 font-interface-sans text-[9px] tracking-[0.3em] text-[#B89A62] uppercase border border-[#B89A62]/30 px-3 py-1.5 bg-black/40 backdrop-blur-md">
                HAUTE PARFUMERIE
              </span>
            </div>

            {/* THUMBNAIL GALLERY */}
            <div className="flex items-center space-x-4">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 bg-[#101617] border p-2 rounded-xs overflow-hidden transition-all ${
                    activeImageIdx === idx ? 'border-[#B89A62]' : 'border-white/[0.08] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} onError={(e) => { e.target.src = "/images/oud_wood.jpg"; }} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: SPECS & BUY ACTION */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* BRAND & NAME */}
            <div className="space-y-2">
              <span className="font-interface-sans text-xs tracking-[0.35em] text-[#8F9897] uppercase font-medium">
                {product.brand}
              </span>

              <h1 className="font-editorial-serif text-5xl sm:text-6xl text-[#F2EFE8] font-light leading-none tracking-tight">
                {product.name}
              </h1>

              <p className="font-interface-sans text-xs tracking-[0.25em] text-[#B89A62] uppercase pt-1">
                {product.concentration || 'EAU DE PARFUM'}
              </p>
            </div>

            {/* PRICE */}
            <div className="font-editorial-serif text-3xl text-[#F2EFE8]">
              ₹{selectedPrice.toLocaleString('en-IN')}
            </div>

            {/* SIZE SELECTOR */}
            <div className="space-y-3 pt-2">
              <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#8F9897] uppercase font-medium block">
                SELECT SIZE
              </span>

              <div className="flex items-center space-x-4">
                {(product.sizes || [{ size: '50 ML', price: 18500 }, { size: '100 ML', price: selectedPrice }]).map((sObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSizeChange(sObj)}
                    className={`px-6 py-3 font-interface-sans text-xs tracking-widest uppercase border transition-all ${
                      selectedSize === sObj.size
                        ? 'border-[#B89A62] bg-[#161C1D] text-[#F2EFE8]'
                        : 'border-white/[0.1] text-[#8F9897] hover:border-white/30'
                    }`}
                  >
                    {sObj.size}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO BAG BUTTON */}
            <div className="pt-4 space-y-3">
              <button 
                onClick={handleAdd}
                className={`w-full py-4 px-8 font-interface-sans text-xs tracking-[0.3em] font-bold uppercase transition-all duration-300 flex items-center justify-center space-x-3 ${
                  added 
                    ? 'bg-emerald-700 text-white' 
                    : 'bg-[#B89A62] hover:bg-[#C0A46D] text-[#080C0D]'
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
                    <span>ADD TO BAG</span>
                  </>
                )}
              </button>
            </div>

            {/* TRUST BADGE */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center space-x-3 text-[11px] text-[#8F9897] font-interface-sans tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#B89A62]" />
              <span>Complimentary White-Glove Express Shipping & Luxury Packaging</span>
            </div>

          </div>

        </div>

        {/* MIDDLE SECTION 1: THE FRAGRANCE */}
        <div className="py-16 border-b border-white/[0.08] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4">
            <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase block mb-2">
              OVERVIEW
            </span>
            <h3 className="font-editorial-serif text-3xl text-[#F2EFE8]">
              THE FRAGRANCE
            </h3>
          </div>

          <div className="md:col-span-8 font-interface-sans text-sm md:text-base text-[#8F9897] font-light leading-relaxed">
            <p>
              {product.description || "Rare oud wood. Sandalwood. Rosewood. Amber. Exotic rosewood and cardamom give way to a smoky blend of rare oud wood, sandalwood and vetiver."}
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION 2: THE NOTES */}
        <div className="py-16 border-b border-white/[0.08] space-y-12">
          <div className="text-center space-y-2">
            <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase">
              OLFACTORY PYRAMID
            </span>
            <h3 className="font-editorial-serif text-4xl text-[#F2EFE8]">
              THE NOTES
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* TOP NOTES */}
            <div className="p-8 bg-[#101617] border border-white/[0.06] rounded-xs space-y-4">
              <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-semibold">
                TOP
              </span>
              <ul className="space-y-2 font-editorial-serif text-xl text-[#F2EFE8]">
                {(product.topNotes || ["Rosewood", "Cardamom", "Sichuan Pepper"]).map((note, nIdx) => (
                  <li key={nIdx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* HEART NOTES */}
            <div className="p-8 bg-[#101617] border border-white/[0.06] rounded-xs space-y-4">
              <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-semibold">
                HEART
              </span>
              <ul className="space-y-2 font-editorial-serif text-xl text-[#F2EFE8]">
                {(product.heartNotes || ["Oud Wood", "Sandalwood", "Vetiver"]).map((note, nIdx) => (
                  <li key={nIdx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* BASE NOTES */}
            <div className="p-8 bg-[#101617] border border-white/[0.06] rounded-xs space-y-4">
              <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-semibold">
                BASE
              </span>
              <ul className="space-y-2 font-editorial-serif text-xl text-[#F2EFE8]">
                {(product.baseNotes || ["Amber", "Tonka Bean", "Vanilla"]).map((note, nIdx) => (
                  <li key={nIdx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION 3: CHARACTER SCALES */}
        <div className="py-16 border-b border-white/[0.08] space-y-12">
          <div className="text-center space-y-2">
            <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase">
              SCENT PROFILE
            </span>
            <h3 className="font-editorial-serif text-4xl text-[#F2EFE8]">
              CHARACTER
            </h3>
          </div>

          <div className="max-w-2xl mx-auto space-y-8 font-interface-sans text-xs tracking-widest uppercase">
            
            {/* WARM --- FRESH */}
            <div className="space-y-2">
              <div className="flex justify-between text-[#8F9897]">
                <span>WARM</span>
                <span>FRESH</span>
              </div>
              <div className="h-1 w-full bg-[#161C1D] rounded-full relative">
                <div 
                  className="absolute top-0 bottom-0 bg-[#B89A62] rounded-full" 
                  style={{ left: '20%', width: '35%' }} 
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#B89A62] rounded-full border-2 border-[#080C0D]"
                  style={{ left: '35%' }}
                />
              </div>
            </div>

            {/* SUBTLE --- INTENSE */}
            <div className="space-y-2">
              <div className="flex justify-between text-[#8F9897]">
                <span>SUBTLE</span>
                <span>INTENSE</span>
              </div>
              <div className="h-1 w-full bg-[#161C1D] rounded-full relative">
                <div 
                  className="absolute top-0 bottom-0 bg-[#B89A62] rounded-full" 
                  style={{ left: '50%', width: '35%' }} 
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#B89A62] rounded-full border-2 border-[#080C0D]"
                  style={{ left: '78%' }}
                />
              </div>
            </div>

            {/* DAY --- NIGHT */}
            <div className="space-y-2">
              <div className="flex justify-between text-[#8F9897]">
                <span>DAY</span>
                <span>NIGHT</span>
              </div>
              <div className="h-1 w-full bg-[#161C1D] rounded-full relative">
                <div 
                  className="absolute top-0 bottom-0 bg-[#B89A62] rounded-full" 
                  style={{ left: '60%', width: '30%' }} 
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#B89A62] rounded-full border-2 border-[#080C0D]"
                  style={{ left: '85%' }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM SECTION: YOU MAY ALSO APPRECIATE */}
        <div className="pt-20 space-y-12">
          <div className="text-center space-y-2">
            <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase">
              RECOMMENDED
            </span>
            <h3 className="font-editorial-serif text-4xl text-[#F2EFE8]">
              YOU MAY ALSO APPRECIATE
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommended.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectProduct(item.id)}
                className="group cursor-pointer p-6 bg-[#101617] border border-white/[0.06] hover:border-[#B89A62]/40 transition-all rounded-xs space-y-4 text-center"
              >
                <div className="h-48 w-full flex items-center justify-center overflow-hidden p-4">
                  <img 
                    src={item.image || "/images/oud_wood.jpg"} 
                    onError={(e) => { e.target.src = "/images/oud_wood.jpg"; }}
                    alt={item.name} 
                    className="max-h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <span className="font-interface-sans text-[9px] tracking-[0.3em] text-[#8F9897] uppercase">
                    {item.brand}
                  </span>
                  <h4 className="font-editorial-serif text-xl text-[#F2EFE8] group-hover:text-[#B89A62] transition-colors">
                    {item.name}
                  </h4>
                  <p className="font-interface-sans text-xs text-[#F2EFE8] font-medium pt-2">
                    ₹{item.price ? item.price.toLocaleString('en-IN') : '21,500'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
