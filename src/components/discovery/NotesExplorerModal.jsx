import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import IllureCrest from '../IllureCrest';
import { useFeatures } from '../../context/FeaturesContext';

export default function NotesExplorerModal({ isOpen, onClose, onSelectNoteFilter, products = [] }) {
  const { isFeatureEnabled, getFeatureConfig, trackFeatureEvent } = useFeatures();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'TOP' | 'HEART' | 'BASE'

  useEffect(() => {
    if (isOpen && isFeatureEnabled('notes_explorer')) {
      trackFeatureEvent('NOTE_VIEWED', 'notes_explorer');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Extract UNIQUE notes strictly from live products
  const liveNotes = useMemo(() => {
    const noteMap = new Map();

    products.forEach((p) => {
      (p.topNotes || []).forEach((note) => {
        const clean = note.trim();
        if (!noteMap.has(clean)) {
          noteMap.set(clean, { name: clean, tier: 'TOP NOTES', count: 1 });
        } else {
          noteMap.get(clean).count++;
        }
      });

      (p.heartNotes || []).forEach((note) => {
        const clean = note.trim();
        if (!noteMap.has(clean)) {
          noteMap.set(clean, { name: clean, tier: 'HEART NOTES', count: 1 });
        } else {
          noteMap.get(clean).count++;
        }
      });

      (p.baseNotes || []).forEach((note) => {
        const clean = note.trim();
        if (!noteMap.has(clean)) {
          noteMap.set(clean, { name: clean, tier: 'BASE NOTES', count: 1 });
        } else {
          noteMap.get(clean).count++;
        }
      });
    });

    return Array.from(noteMap.values());
  }, [products]);

  if (!isOpen || !isFeatureEnabled('notes_explorer')) return null;

  const config = getFeatureConfig('notes_explorer') || {};
  const title = config.title || 'EXPLORE BY NOTE';

  const filteredNotes = liveNotes.filter((n) => {
    const matchesSearch = n.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' ||
      (selectedCategory === 'TOP' && n.tier === 'TOP NOTES') ||
      (selectedCategory === 'HEART' && n.tier === 'HEART NOTES') ||
      (selectedCategory === 'BASE' && n.tier === 'BASE NOTES');
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (noteName) => {
    trackFeatureEvent('NOTE_PRODUCT_CLICKED', 'notes_explorer', { note: noteName });
    if (onSelectNoteFilter) {
      onSelectNoteFilter(noteName);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-explorer-title"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0E1011] border border-[#D8BE82]/30 p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#AAA297] hover:text-[#D8BE82] p-2 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6 flex-shrink-0">
          <div className="flex items-center justify-center space-x-2">
            <IllureCrest size={18} className="text-[#C7A866]" />
            <span className="font-bodoni text-base tracking-[0.25em] text-[#F7F3EA] uppercase">
              İLLURÊ
            </span>
          </div>
          <h2 id="notes-explorer-title" className="font-bodoni text-xl md:text-2xl text-[#F7F3EA] tracking-wide uppercase pt-1">
            {title}
          </h2>
          <p className="text-xs text-[#AAA297]">
            Select any note to view matching fragrances in our collection.
          </p>
        </div>

        {/* Search & Tier Filters */}
        <div className="space-y-3 mb-5 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#C7A866] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes (e.g. Oud, Bergamot, Amber)..."
              className="w-full bg-[#14120F] border border-[#D8BE82]/25 py-2.5 pl-9 pr-4 text-xs text-[#F7F3EA] placeholder-[#80683E] focus:outline-none focus:border-[#C7A866]"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1">
            {['ALL', 'TOP', 'HEART', 'BASE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 uppercase tracking-wider text-[10px] rounded-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#C7A866] text-[#080A0B] font-semibold'
                    : 'bg-[#14120F] text-[#AAA297] hover:text-[#F7F3EA] border border-[#D8BE82]/15'
                }`}
              >
                {cat === 'ALL' ? 'ALL NOTES' : `${cat} NOTES`}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-grow">
          {filteredNotes.length === 0 ? (
            <div className="py-16 text-center space-y-2 text-[#AAA297] text-xs">
              <p>No fragrances currently match this note.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                }}
                className="text-[#C7A866] hover:underline uppercase text-[10px] tracking-wider"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredNotes.map((note, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(note.name)}
                  className="p-3 bg-[#14120F] border border-[#D8BE82]/15 hover:border-[#D8BE82]/60 hover:bg-[#1A1814] text-left transition-all group flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-medium text-[#F7F3EA] group-hover:text-[#D8BE82] tracking-wide block">
                      {note.name}
                    </span>
                    <span className="text-[9px] text-[#C7A866] uppercase tracking-widest block mt-0.5">
                      {note.tier} · {note.count} {note.count === 1 ? 'fragrance' : 'fragrances'}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C7A866] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
