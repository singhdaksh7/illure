import React, { useState } from 'react';
import { X, Search, Sparkles, ArrowRight } from 'lucide-react';
import IllureCrest from '../IllureCrest';
import { useFeatures } from '../../context/FeaturesContext';

const ARCHIVAL_NOTES = [
  {
    category: 'Top Notes',
    description: 'The initial impression. Evaporates within the first 15–30 minutes, setting the emotional atmosphere.',
    notes: [
      { name: 'Calabrian Bergamot', family: 'Citrus', character: 'Sparkling, crisp, sunlit peel with subtle bitter undertone' },
      { name: 'Cardamom Pods', family: 'Spicy', character: 'Resinous, aromatic, gently warm and intoxicatingly spicy' },
      { name: 'Saffron Threads', family: 'Spicy / Metallic', character: 'Golden, leather-like, bittersweet, and imperial' },
      { name: 'Grandiflorum Jasmine', family: 'Floral', character: 'Aerial, opulent, nectarous white bloom' },
      { name: 'Pink Pepper', family: 'Spicy', character: 'Vibrant, rosy piquancy that lifts heavier accords' },
      { name: 'Blackcurrant Bud', family: 'Fruity', character: 'Tart, verdant, dynamic dark berry freshness' },
    ],
  },
  {
    category: 'Heart Notes',
    description: 'The soul of the composition. Emerges as the top notes soften, lingering for 3 to 6 hours.',
    notes: [
      { name: 'Smoky Oud Wood', family: 'Woody / Resin', character: 'Dark balsamic resin harvested from aged aquilaria trees' },
      { name: 'May Rose (Rosa Centifolia)', family: 'Floral', character: 'Velvety, honey-glazed petals harvested at dawn' },
      { name: 'Iris Butter (Orris)', family: 'Powdery / Floral', character: 'Noble, cool, powdery suede with buttery elegance' },
      { name: 'Bitter Almond', family: 'Gourmand / Nutty', character: 'Sweet, marzipan warmth with an aristocratic bite' },
      { name: 'Cedarwood Atlas', family: 'Woody', character: 'Dry, pencil-shaving warmth with clean resinous backbone' },
      { name: 'Mysore Sandalwood', family: 'Woody', character: 'Creamy, lactonic, sacred warmth that wraps skin closely' },
    ],
  },
  {
    category: 'Base Notes',
    description: 'The foundation & skin signature. Deep molecular fixatives that linger 12 to 24+ hours.',
    notes: [
      { name: 'Ambergris Accord', family: 'Marine / Mineral', character: 'Salty, warm oceanic musk that melds into body chemistry' },
      { name: 'Madagascar Tonka Bean', family: 'Amber / Gourmand', character: 'Warm hay, almond, caramelized vanilla nuances' },
      { name: 'Smoky Birch Tar', family: 'Leathery', character: 'Peaty, cuoio leather, campfire elegance' },
      { name: 'Golden Amber Resin', family: 'Amber', character: 'Glowing, balsamic fossilized resin and benzoin' },
      { name: 'White Cashmere Musk', family: 'Musk', character: 'Soft second-skin aura that radiates effortless intimacy' },
      { name: 'Bourbon Vanilla Bean', family: 'Gourmand', character: 'Dark, woody pod infused with dark aged spirit' },
    ],
  },
];

export default function NotesExplorerModal({ isOpen, onClose, onSelectNoteFilter }) {
  const { isFeatureEnabled, getFeatureConfig, trackFeatureEvent } = useFeatures();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('ALL');

  if (!isOpen || !isFeatureEnabled('notes_explorer')) return null;

  const config = getFeatureConfig('notes_explorer') || {};
  const title = config.title || 'THE OLFACTORY ARCHIVE & NOTES DIRECTORY';
  const subtitle = config.subtitle || 'COMPENDIUM OF RAW EXTRACTS & ACCORDS';

  const families = ['ALL', 'Woody', 'Floral', 'Citrus', 'Spicy', 'Amber', 'Musk'];

  const filteredCategories = ARCHIVAL_NOTES.map(section => {
    const filteredNotes = section.notes.filter(note => {
      const matchSearch = note.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.character.toLowerCase().includes(searchTerm.toLowerCase());
      const matchFam = selectedFamily === 'ALL' || note.family.toLowerCase().includes(selectedFamily.toLowerCase());
      return matchSearch && matchFam;
    });
    return { ...section, notes: filteredNotes };
  }).filter(s => s.notes.length > 0);

  const handleSelectNote = (noteName) => {
    trackFeatureEvent('NOTE_CLICKED', 'notes_explorer', { note: noteName });
    if (onSelectNoteFilter) {
      onSelectNoteFilter(noteName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0E1011] border border-[#D8BE82]/30 p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#AAA297] hover:text-[#D8BE82] transition-colors p-2 z-10"
          aria-label="Close Notes Directory"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 mb-6 flex-shrink-0">
          <div className="flex items-center justify-center space-x-2">
            <IllureCrest size={20} className="text-[#C7A866]" />
            <span className="font-bodoni text-lg tracking-[0.25em] text-[#F7F3EA] uppercase">
              İLLURÊ
            </span>
          </div>
          <span className="typography-eyebrow text-[#C7A866] block">
            {subtitle}
          </span>
          <h3 className="typography-h2 text-[#F7F3EA]">
            {title}
          </h3>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3 mb-6 flex-shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#C7A866] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search botanical note or accord (e.g. Saffron, Ambergris, Bergamot)..."
              className="w-full bg-[#14120F] border border-[#D8BE82]/25 py-2.5 pl-10 pr-4 text-xs text-[#F7F3EA] placeholder-[#80683E] focus:outline-none focus:border-[#C7A866]"
            />
          </div>

          {/* Family Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {families.map(fam => (
              <button
                key={fam}
                onClick={() => setSelectedFamily(fam)}
                className={`px-3 py-1 uppercase tracking-wider text-[10px] rounded-xs transition-colors flex-shrink-0 ${
                  selectedFamily === fam
                    ? 'bg-[#C7A866] text-[#080A0B] font-semibold'
                    : 'bg-[#14120F] text-[#AAA297] hover:text-[#F7F3EA] border border-[#D8BE82]/15'
                }`}
              >
                {fam}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Content List */}
        <div className="overflow-y-auto space-y-8 pr-2 custom-scrollbar flex-grow">
          {filteredCategories.length === 0 ? (
            <div className="py-12 text-center text-[#AAA297] text-xs">
              No matching archival notes found for your criteria.
            </div>
          ) : (
            filteredCategories.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <div className="border-b border-[#D8BE82]/15 pb-2">
                  <h4 className="typography-eyebrow text-[#C7A866]">
                    {cat.category}
                  </h4>
                  <p className="text-[11px] text-[#AAA297]">
                    {cat.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {cat.notes.map((note, nIdx) => (
                    <div
                      key={nIdx}
                      onClick={() => handleSelectNote(note.name)}
                      className="p-3.5 bg-[#14120F] border border-[#D8BE82]/15 hover:border-[#D8BE82]/50 hover:bg-[#1A1814] cursor-pointer transition-all group flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium text-[#F7F3EA] group-hover:text-[#D8BE82] tracking-wide block">
                            {note.name}
                          </span>
                          <span className="text-[10px] text-[#C7A866] uppercase tracking-wider">
                            {note.family}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#C7A866] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-[#AAA297] font-light leading-relaxed">
                        {note.character}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
