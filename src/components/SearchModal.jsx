import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, productsData, onSelectProduct }) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = query.trim()
    ? productsData.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.fragranceFamily.toLowerCase().includes(query.toLowerCase()) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-6 select-none">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#080C0D]/90 backdrop-blur-xl transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-3xl bg-[#101617] border border-white/[0.08] p-8 rounded-xs shadow-2xl space-y-6 text-[#F2EFE8] animate-in fade-in zoom-in-95 duration-200">
        
        {/* TOP SEARCH BAR */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-4 flex-1">
            <Search className="w-5 h-5 text-[#B89A62]" />
            <input 
              type="text" 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH FRAGRANCE, BRAND OR NOTE (e.g. Oud, Tom Ford, Fresh)..."
              className="w-full bg-transparent border-none text-sm md:text-base font-interface-sans tracking-wide text-[#F2EFE8] placeholder-[#8F9897]/60 focus:outline-none"
            />
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-[#8F9897] hover:text-[#F2EFE8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RESULTS LIST */}
        <div className="max-h-[50vh] overflow-y-auto space-y-4 no-scrollbar">
          {query.trim() === '' ? (
            <div className="py-8 space-y-3">
              <span className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase block">
                SUGGESTED SEARCHES
              </span>
              <div className="flex flex-wrap gap-2 font-interface-sans text-xs text-[#8F9897]">
                {["Tom Ford Oud Wood", "Creed Aventus", "Dior Sauvage Elixir", "Woody", "Amber", "Niche"].map((term, tIdx) => (
                  <button 
                    key={tIdx}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 bg-[#161C1D] border border-white/[0.06] hover:border-[#B89A62] hover:text-[#F2EFE8] transition-colors rounded-xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-[#8F9897]">
              <p className="font-editorial-serif text-xl">No fragrances matched “{query}”</p>
            </div>
          ) : (
            results.map((product) => (
              <div 
                key={product.id}
                onClick={() => {
                  onSelectProduct(product.id);
                  onClose();
                }}
                className="group p-4 bg-[#161C1D]/60 hover:bg-[#161C1D] border border-white/[0.04] hover:border-[#B89A62]/40 transition-all rounded-xs flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={product.image || "/images/oud_wood.jpg"} 
                    onError={(e) => { e.target.src = "/images/oud_wood.jpg"; }}
                    alt="" 
                    className="w-12 h-14 object-contain bg-[#080C0D] p-1 border border-white/[0.04]"
                  />
                  <div>
                    <span className="font-interface-sans text-[9px] tracking-[0.25em] text-[#8F9897] uppercase">
                      {product.brand}
                    </span>
                    <h5 className="font-editorial-serif text-lg text-[#F2EFE8] group-hover:text-[#B89A62] transition-colors">
                      {product.name}
                    </h5>
                    <p className="font-interface-sans text-[11px] text-[#8F9897] font-light">
                      {product.fragranceFamily} · ₹{product.price ? product.price.toLocaleString('en-IN') : '21,500'}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[#B89A62] group-hover:translate-x-1 transition-transform" />
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
