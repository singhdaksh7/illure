import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles, Droplets, Compass } from 'lucide-react';
import IllureCrest from './IllureCrest';

export default function SearchModal({ isOpen, onClose, productsData = [], onSelectProduct }) {
  const [query, setQuery] = useState('');
  const [apiResults, setApiResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch backend advanced search results with debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setApiResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setApiResults(json.data);
        }
      } catch (err) {
        console.warn('Backend search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  // Fallback local results
  const localResults = query.trim()
    ? productsData.filter(
        (p) =>
          p.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.brand?.toLowerCase().includes(query.toLowerCase()) ||
          p.inspiredByName?.toLowerCase().includes(query.toLowerCase()) ||
          p.fragranceFamily?.toLowerCase().includes(query.toLowerCase()) ||
          (p.topNotes && p.topNotes.some((n) => n.toLowerCase().includes(query.toLowerCase()))) ||
          (p.heartNotes && p.heartNotes.some((n) => n.toLowerCase().includes(query.toLowerCase()))) ||
          (p.baseNotes && p.baseNotes.some((n) => n.toLowerCase().includes(query.toLowerCase())))
      )
    : [];

  const displayedFragrances = apiResults?.fragrances?.length ? apiResults.fragrances : localResults;
  const displayedNotes = apiResults?.notes || [];
  const displayedFamilies = apiResults?.families || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 sm:px-6 select-none animate-fade-up">
      {/* Cinematic Full Screen Backdrop */}
      <div className="fixed inset-0 bg-[#080A0B]/95 backdrop-blur-2xl transition-opacity" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative z-10 w-full max-w-4xl bg-[#0E1011] border border-[#C7A866]/30 p-6 md:p-10 rounded-xs shadow-[0_25px_60px_rgba(0,0,0,0.95)] space-y-8 text-[#F7F3EA]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2.5">
            <IllureCrest size={20} className="text-[#D8BE82]" />
            <span className="font-editorial-serif text-lg tracking-[0.25em] text-[#F7F3EA] uppercase">
              İLLURÊ SEARCH
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#AAA297] hover:text-[#F7F3EA] transition-colors cursor-pointer"
            aria-label="Close Search"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Cinematic Oversized Search Input */}
        <div className="space-y-2">
          <label className="text-[10px] tracking-[0.25em] text-[#D8BE82] uppercase block font-medium">
            SEARCH ATELIER ARCHIVE
          </label>
          <div className="flex items-center space-x-4 border-b-2 border-[#C7A866]/50 pb-3 focus-within:border-[#D8BE82] transition-colors">
            <Search className="w-6 h-6 text-[#C7A866] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fragrances, raw accords, notes, olfactive families..."
              className="w-full bg-transparent border-none font-editorial-serif text-2xl md:text-3xl tracking-wide text-[#F7F3EA] placeholder-[#AAA297]/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Results / Suggestions Container */}
        <div className="max-h-[50vh] overflow-y-auto space-y-6 no-scrollbar pr-1">
          {query.trim() === '' ? (
            <div className="py-4 space-y-4">
              <span className="text-[10px] tracking-[0.25em] text-[#AAA297] uppercase block font-semibold">
                CURATED INQUIRIES
              </span>
              <div className="flex flex-wrap gap-2.5 text-xs text-[#AAA297]">
                {[
                  'Oud Wood',
                  'Amber & Oriental',
                  'Smoky Cedar',
                  'Imperial Sovereign',
                  'Aqua Edge',
                  'Velvet Oud',
                  'Bergamot',
                ].map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-[#14120F] border border-white/[0.08] hover:border-[#C7A866] hover:text-[#F7F3EA] transition-all rounded-xs font-interface-sans tracking-wider cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : displayedFragrances.length === 0 && displayedNotes.length === 0 && displayedFamilies.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-[#AAA297]">
              <p className="font-editorial-serif text-2xl text-[#F7F3EA]">No matches for “{query}”</p>
              <p className="text-xs">Try searching by note (e.g. Amber, Oud), family, or signature name.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grouped Match: Raw Notes & Accords */}
              {displayedNotes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] tracking-[0.25em] text-[#D8BE82] uppercase flex items-center gap-1.5 font-semibold">
                    <Droplets className="w-3.5 h-3.5" />
                    MATCHING NOTES &amp; ACCORDS
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displayedNotes.map((note, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(note)}
                        className="px-3 py-1.5 bg-[#14120F] border border-[#C7A866]/30 text-[#D8BE82] hover:bg-[#C7A866]/20 text-xs rounded-xs font-mono cursor-pointer transition-colors"
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grouped Match: Olfactive Families */}
              {displayedFamilies.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] tracking-[0.25em] text-[#D8BE82] uppercase flex items-center gap-1.5 font-semibold">
                    <Compass className="w-3.5 h-3.5" />
                    OLFACTIVE FAMILIES
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {displayedFamilies.map((fam, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuery(fam)}
                        className="px-3 py-1.5 bg-[#14120F] border border-white/10 text-[#F7F3EA] hover:border-[#C7A866] text-xs rounded-xs cursor-pointer transition-colors"
                      >
                        {fam}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grouped Match: Fragrances */}
              <div className="space-y-3">
                <span className="text-[10px] tracking-[0.25em] text-[#D8BE82] uppercase block font-semibold">
                  FRAGRANCES ({displayedFragrances.length})
                </span>
                {displayedFragrances.map((product) => {
                  const displayImg =
                    product.primaryImage ||
                    product.image ||
                    (product.images && product.images[0]?.url) ||
                    '/images/illure-placeholder.svg';

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (onSelectProduct) onSelectProduct(product.id);
                        onClose();
                      }}
                      className="group p-4 bg-[#14120F] hover:bg-[#1A1815] border border-white/[0.06] hover:border-[#C7A866]/50 transition-all rounded-xs flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-16 bg-[#080A0B] border border-white/[0.06] p-1.5 flex items-center justify-center rounded-xs shrink-0">
                          <img
                            src={displayImg}
                            onError={(e) => {
                              e.currentTarget.src = '/images/illure-placeholder.svg';
                            }}
                            alt=""
                            className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] tracking-[0.25em] text-[#D8BE82] uppercase block">
                            {product.fragranceFamily || 'HAUTE PARFUMERIE'}
                          </span>
                          <h5 className="font-editorial-serif text-xl text-[#F7F3EA] group-hover:text-[#D8BE82] transition-colors leading-snug">
                            {product.name}
                          </h5>
                          {product.inspiredByName && (
                            <p className="text-xs text-[#AAA297] font-light">Inspired by {product.inspiredByName}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-right">
                        {product.startingPrice || product.minPrice || product.price ? (
                          <div>
                            <span className="text-[9px] tracking-wider text-[#AAA297] block uppercase font-mono">
                              STARTING AT
                            </span>
                            <span className="font-editorial-serif text-lg text-[#F7F3EA] font-light">
                              ₹{(product.startingPrice || product.minPrice || product.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : null}
                        <ArrowRight className="w-4 h-4 text-[#C7A866] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
