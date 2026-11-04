import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import IllureCrest from './IllureCrest';

export default function SearchModal({ isOpen, onClose, productsData = [], onSelectProduct }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? productsData.filter(p => 
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.brand?.toLowerCase().includes(query.toLowerCase()) ||
        p.inspiredByName?.toLowerCase().includes(query.toLowerCase()) ||
        p.fragranceFamily?.toLowerCase().includes(query.toLowerCase()) ||
        (p.topNotes && p.topNotes.some(n => n.toLowerCase().includes(query.toLowerCase()))) ||
        (p.heartNotes && p.heartNotes.some(n => n.toLowerCase().includes(query.toLowerCase()))) ||
        (p.baseNotes && p.baseNotes.some(n => n.toLowerCase().includes(query.toLowerCase())))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 sm:px-6 select-none animate-fade-up">
      
      {/* Cinematic Full Screen Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0B0C]/95 backdrop-blur-2xl transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-4xl bg-[#121214] border border-[#B89A62]/30 p-6 md:p-10 rounded-xs shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-8 text-[#F7F4EE]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <IllureCrest size={20} className="text-[#B89A62]" />
            <span className="font-bodoni text-lg tracking-[0.25em] text-[#F7F4EE] uppercase">
              İLLURÊ SEARCH
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-[#A1A1AA] hover:text-[#F7F4EE] transition-colors"
            aria-label="Close Search"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Cinematic Oversized Search Input */}
        <div className="space-y-2">
          <label className="text-[10px] tracking-[0.25em] text-[#B89A62] uppercase block font-medium">
            DISCOVER YOUR SILHOUETTE
          </label>
          <div className="flex items-center space-x-4 border-b-2 border-[#B89A62]/50 pb-3 focus-within:border-[#B89A62] transition-colors">
            <Search className="w-6 h-6 text-[#B89A62] shrink-0" />
            <input 
              type="text" 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for? (e.g. Oud, Creed, Smoky, Amber)..."
              className="w-full bg-transparent border-none font-editorial-serif text-2xl md:text-3xl tracking-wide text-[#F7F4EE] placeholder-[#A1A1AA]/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Results / Suggestions Container */}
        <div className="max-h-[50vh] overflow-y-auto space-y-4 no-scrollbar pr-1">
          {query.trim() === '' ? (
            <div className="py-4 space-y-4">
              <span className="text-[10px] tracking-[0.25em] text-[#A1A1AA] uppercase block font-semibold">
                CURATED SEARCH REPERTORY
              </span>
              <div className="flex flex-wrap gap-2.5 text-xs text-[#A1A1AA]">
                {[
                  "Tom Ford Oud Wood",
                  "Creed Aventus",
                  "Dior Sauvage Elixir",
                  "Smoky Amber",
                  "Royal Oud",
                  "Fresh Citrus",
                  "Evening Sillage"
                ].map((term, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-[#18181B] border border-white/[0.08] hover:border-[#B89A62] hover:text-[#F7F4EE] transition-all rounded-xs font-interface-sans tracking-wider"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-[#A1A1AA]">
              <p className="font-editorial-serif text-2xl text-[#F7F4EE]">
                No fragrances found for “{query}”
              </p>
              <p className="text-xs">
                Try searching by note (e.g. Sandalwood, Cardamom) or house inspiration.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.25em] text-[#B89A62] uppercase block font-semibold">
                MATCHING FLACONS ({results.length})
              </span>
              {results.map((product) => (
                <div 
                  key={product.id}
                  onClick={() => {
                    if (onSelectProduct) onSelectProduct(product.id);
                    onClose();
                  }}
                  className="group p-4 bg-[#18181B] hover:bg-[#202024] border border-white/[0.06] hover:border-[#B89A62]/50 transition-all rounded-xs flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-16 bg-[#0B0B0C] border border-white/[0.06] p-1.5 flex items-center justify-center rounded-xs shrink-0">
                      <img 
                        src={product.image || "/images/illure-placeholder.svg"} 
                        onError={(e) => { e.target.src = "/images/illure-placeholder.svg"; }}
                        alt="" 
                        className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] tracking-[0.25em] text-[#B89A62] uppercase block">
                        {product.brand || 'İLLURÊ RESERVE'} · PARFUM
                      </span>
                      <h5 className="font-editorial-serif text-xl text-[#F7F4EE] group-hover:text-[#B89A62] transition-colors leading-snug">
                        {product.name}
                      </h5>
                      <p className="text-xs text-[#A1A1AA] font-light">
                        Inspired by {product.inspiredByName || product.brand}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    {(() => {
                      let prices = [];
                      if (product.variants && product.variants.length > 0) {
                        prices = product.variants.map((v) => Number(v.price)).filter((p) => !isNaN(p) && p > 0);
                      }
                      if (prices.length === 0 && product.minPrice && Number(product.minPrice) > 0) {
                        prices.push(Number(product.minPrice));
                      }
                      if (prices.length === 0 && product.price && Number(product.price) > 0) {
                        prices.push(Number(product.price));
                      }
                      const searchPrice = prices.length > 0 ? Math.min(...prices) : null;

                      return searchPrice ? (
                        <div>
                          <span className="text-[9px] tracking-wider text-[#A1A1AA] block uppercase font-mono">
                            STARTING AT
                          </span>
                          <span className="font-editorial-serif text-lg text-[#F7F4EE] font-light">
                            ₹{searchPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs tracking-widest text-[#A1A1AA] uppercase">
                          INQUIRE
                        </span>
                      );
                    })()}
                    <ArrowRight className="w-4 h-4 text-[#B89A62] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
