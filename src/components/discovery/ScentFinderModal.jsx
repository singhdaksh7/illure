import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, RotateCcw, Check } from 'lucide-react';
import IllureCrest from '../IllureCrest';
import { useFeatures } from '../../context/FeaturesContext';

export default function ScentFinderModal({ isOpen, onClose, onSelectProduct, products = [] }) {
  const { isFeatureEnabled, getFeatureConfig, trackFeatureEvent } = useFeatures();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    vibe: null,
    occasion: null,
    intensity: null,
    familyPreference: null,
  });
  const [matchResult, setMatchResult] = useState(null);

  if (!isOpen || !isFeatureEnabled('scent_finder')) return null;

  const featureConfig = getFeatureConfig('scent_finder') || {};
  const quizTitle = featureConfig.title || 'DISCOVER YOUR SIGNATURE SCENT';
  const quizSubtitle = featureConfig.subtitle || 'AN ARCHIVAL OLFACTORY CONSULTATION';

  const questions = [
    {
      id: 'vibe',
      title: 'WHAT AURA DO YOU WISH TO PROJECT?',
      subtitle: 'Select the mood that best captures your presence.',
      options: [
        { label: 'Dark, Enigmatic & Sensual', value: 'dark', hint: 'Smoky woods, deep resin, late nights' },
        { label: 'Sharp, Clean & Commanding', value: 'fresh', hint: 'Crisp bergamot, vetiver, boardroom precision' },
        { label: 'Opulent, Warm & Magnetic', value: 'amber', hint: 'Tonka, saffron, golden honeyed amber' },
        { label: 'Subtle, Intimate & Second-Skin', value: 'musk', hint: 'Clean iris, cashmere, quiet whispers' },
      ],
    },
    {
      id: 'occasion',
      title: 'WHEN WILL THIS FRAGRANCE BE WORN?',
      subtitle: 'Choose the primary atmosphere for your formulation.',
      options: [
        { label: 'Evening & Black Tie Gatherings', value: 'evening', hint: 'High projection, memorable trail' },
        { label: 'Daily Signature Presence', value: 'daily', hint: 'Balanced, versatile, effortlessly refined' },
        { label: 'Intimate Dates & Close Quarters', value: 'intimate', hint: 'Warm drydown, skin-close sillage' },
        { label: 'Special Milestones & Celebrations', value: 'special', hint: 'Exotic, distinctive, extrait intensity' },
      ],
    },
    {
      id: 'intensity',
      title: 'DESIRED PROJECTION & LONGEVITY',
      subtitle: 'How prominently should the scent radiate?',
      options: [
        { label: 'Subtle & Discreet', value: 'subtle', hint: 'Discovered only in close embrace' },
        { label: 'Moderate & Elegant', value: 'moderate', hint: 'Noticeable yet polite, 6-8 hours' },
        { label: 'High & Enveloping', value: 'intense', hint: 'Leaves an unmistakable sillage, 10-14 hours' },
      ],
    },
  ];

  const handleSelectOption = (questionId, value) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate best recommendation
      calculateRecommendation(updated);
    }
  };

  const calculateRecommendation = (finalAnswers) => {
    trackFeatureEvent('QUIZ_COMPLETED', 'scent_finder', { answers: finalAnswers });

    let candidates = [...products];

    // Priority 1: Fragrance Family match
    if (finalAnswers.vibe === 'dark') {
      candidates = candidates.filter(p => 
        p.fragranceFamily?.toLowerCase().includes('wood') ||
        p.fragranceFamily?.toLowerCase().includes('oud') ||
        p.name?.toLowerCase().includes('oud')
      );
    } else if (finalAnswers.vibe === 'fresh') {
      candidates = candidates.filter(p => 
        p.fragranceFamily?.toLowerCase().includes('fresh') ||
        p.fragranceFamily?.toLowerCase().includes('citrus') ||
        p.name?.toLowerCase().includes('aventus')
      );
    } else if (finalAnswers.vibe === 'amber') {
      candidates = candidates.filter(p => 
        p.fragranceFamily?.toLowerCase().includes('amber') ||
        p.fragranceFamily?.toLowerCase().includes('spicy') ||
        p.name?.toLowerCase().includes('baccarat')
      );
    } else if (finalAnswers.vibe === 'musk') {
      candidates = candidates.filter(p => 
        p.fragranceFamily?.toLowerCase().includes('musk') ||
        p.fragranceFamily?.toLowerCase().includes('floral')
      );
    }

    // Fallback if filter too narrow
    if (candidates.length === 0) {
      candidates = products.filter(p => p.bestseller) || products;
    }

    const winner = candidates[0] || products[0];
    setMatchResult(winner);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({ vibe: null, occasion: null, intensity: null, familyPreference: null });
    setMatchResult(null);
  };

  const handleProceedToProduct = () => {
    if (matchResult && onSelectProduct) {
      onSelectProduct(matchResult.id);
      trackFeatureEvent('RECOMMENDATION_CLICKED', 'scent_finder', { productId: matchResult.id });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#0E1011] border border-[#D8BE82]/30 p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#AAA297] hover:text-[#D8BE82] transition-colors p-2"
          aria-label="Close Quiz"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Top Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <IllureCrest size={20} className="text-[#C7A866]" />
            <span className="font-bodoni text-lg tracking-[0.25em] text-[#F7F3EA] uppercase">
              İLLURÊ
            </span>
          </div>
          <span className="typography-eyebrow text-[#C7A866] block">
            {quizSubtitle}
          </span>
          <h3 className="typography-h2 text-[#F7F3EA]">
            {quizTitle}
          </h3>
        </div>

        {/* QUIZ IN PROGRESS */}
        {!matchResult && (
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between text-xs text-[#AAA297] font-interface-sans border-b border-[#D8BE82]/15 pb-3">
              <span>STEP 0{currentStep + 1} OF 0{questions.length}</span>
              <div className="flex space-x-1.5">
                {questions.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-6 bg-[#C7A866]'
                        : idx < currentStep
                        ? 'w-2 bg-[#80683E]'
                        : 'w-2 bg-[#222426]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current Question */}
            <div className="space-y-1">
              <h4 className="text-sm md:text-base font-interface-sans font-medium text-[#F7F3EA] tracking-wider uppercase">
                {questions[currentStep].title}
              </h4>
              <p className="text-xs text-[#AAA297]">
                {questions[currentStep].subtitle}
              </p>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {questions[currentStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectOption(questions[currentStep].id, opt.value)}
                  className="w-full text-left p-4 bg-[#14120F] border border-[#D8BE82]/20 hover:border-[#D8BE82]/60 hover:bg-[#1A1814] transition-all duration-200 group flex items-start justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs md:text-sm font-medium tracking-wide text-[#F7F3EA] group-hover:text-[#D8BE82] transition-colors">
                      {opt.label}
                    </span>
                    <p className="text-[11px] text-[#AAA297] font-light">
                      {opt.hint}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#C7A866] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MATCH RESULT FOUND */}
        {matchResult && (
          <div className="space-y-6 pt-2 animate-fade-in">
            <div className="p-4 bg-[#14120F] border border-[#C7A866]/30 text-center space-y-1">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C7A866] block">
                YOUR ARCHIVAL MATCH
              </span>
              <p className="font-bodoni text-2xl text-[#F7F3EA]">
                {matchResult.name}
              </p>
              <p className="text-xs text-[#AAA297] italic">
                {matchResult.brand || 'İLLURÊ RESERVE'} · {matchResult.fragranceFamily || 'Master Creation'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="relative aspect-square max-h-[220px] mx-auto bg-[#080A0B] border border-[#D8BE82]/15 p-2 overflow-hidden flex items-center justify-center">
                <img
                  src={matchResult.images?.[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600'}
                  alt={matchResult.name}
                  className="w-full h-full object-cover rounded-xs"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#C7A866] uppercase tracking-wider block font-medium">
                    OLFACTORY NOTES
                  </span>
                  <p className="text-[#D8D0C3] line-clamp-2 mt-0.5">
                    {matchResult.topNotes?.join(', ') || 'Citrus, Rare Woods, Warm Resin'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#C7A866] uppercase tracking-wider block font-medium">
                    CHARACTER
                  </span>
                  <p className="text-[#AAA297] line-clamp-2">
                    {matchResult.shortDescription || matchResult.description || 'Rich complexity with seamless skin longevity.'}
                  </p>
                </div>

                {matchResult.price && (
                  <div className="pt-2">
                    <span className="text-xs text-[#AAA297] block">From</span>
                    <span className="font-editorial-serif text-xl text-[#F7F3EA]">
                      ₹{matchResult.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#D8BE82]/15">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 text-xs text-[#AAA297] hover:text-[#F7F3EA] flex items-center justify-center space-x-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="tracking-wider uppercase">RETAKE QUIZ</span>
              </button>

              <button
                onClick={handleProceedToProduct}
                className="w-full sm:w-auto px-8 py-3 bg-[#C7A866] hover:bg-[#D8BE82] text-[#080A0B] text-xs font-semibold tracking-widest uppercase transition-colors flex items-center justify-center space-x-2 shadow-[0_4px_15px_rgba(199,168,102,0.25)]"
              >
                <span>EXPLORE FORMULATION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
