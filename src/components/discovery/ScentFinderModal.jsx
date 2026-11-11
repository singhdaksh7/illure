import React, { useState, useEffect } from 'react';
import { X, ArrowRight, RotateCcw } from 'lucide-react';
import IllureCrest from '../IllureCrest';
import { useFeatures } from '../../context/FeaturesContext';

const DEFAULT_QUESTIONS = [
  {
    id: 'mood',
    prompt: 'What are you in the mood for?',
    options: [
      { label: 'FRESH', value: 'fresh', explanation: 'clean citrus and mountain air' },
      { label: 'WARM', value: 'warm', explanation: 'golden amber and rich vanilla' },
      { label: 'WOODY', value: 'woody', explanation: 'smoky cedar and aged woods' },
      { label: 'SWEET', value: 'sweet', explanation: 'tonka bean and caramelized honey' },
      { label: 'CLEAN', value: 'clean', explanation: 'soft iris and velvet florals' },
    ],
  },
  {
    id: 'occasion',
    prompt: 'When will you wear it?',
    options: [
      { label: 'EVERYDAY', value: 'everyday' },
      { label: 'OFFICE', value: 'office' },
      { label: 'DATE NIGHT', value: 'date_night' },
      { label: 'EVENING', value: 'evening' },
      { label: 'WEEKEND', value: 'weekend' },
    ],
  },
  {
    id: 'intensity',
    prompt: 'How do you like your fragrance?',
    options: [
      { label: 'SUBTLE', value: 'subtle' },
      { label: 'BALANCED', value: 'balanced' },
      { label: 'BOLD', value: 'bold' },
    ],
  },
];

export default function ScentFinderModal({ isOpen, onClose, onSelectProduct, products = [] }) {
  const { isFeatureEnabled, getFeatureConfig, trackFeatureEvent } = useFeatures();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [matchResult, setMatchResult] = useState(null);
  const [matchReason, setMatchReason] = useState('');

  // Track modal open
  useEffect(() => {
    if (isOpen && isFeatureEnabled('scent_finder')) {
      trackFeatureEvent('SCENT_FINDER_STARTED', 'scent_finder');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !isFeatureEnabled('scent_finder')) return null;

  const config = getFeatureConfig('scent_finder') || {};
  const quizTitle = config.title || 'FIND YOUR SCENT';
  const ctaText = config.ctaText || 'VIEW FRAGRANCE';
  const questions = config.questions && Array.isArray(config.questions) && config.questions.length > 0 
    ? config.questions 
    : DEFAULT_QUESTIONS;

  const currentQ = questions[currentStep] || questions[0];

  const handleSelectOption = (questionId, option) => {
    const updatedAnswers = { ...answers, [questionId]: option.value };
    setAnswers(updatedAnswers);
    trackFeatureEvent('SCENT_FINDER_ANSWERED', 'scent_finder', { questionId, value: option.value });

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(updatedAnswers);
    }
  };

  const calculateResult = (finalAnswers) => {
    trackFeatureEvent('SCENT_FINDER_COMPLETED', 'scent_finder', { answers: finalAnswers });

    const moodVal = finalAnswers.mood || 'fresh';
    const occasionVal = finalAnswers.occasion || 'everyday';
    const intensityVal = finalAnswers.intensity || 'balanced';

    // Filter candidate products from live database products
    let pool = [...products].filter(p => p.status !== 'ARCHIVED' && p.status !== 'DRAFT');
    if (pool.length === 0) pool = [...products];

    let scored = pool.map(product => {
      let score = 0;
      const fam = (product.fragranceFamily || '').toLowerCase();
      const top = (product.topNotes || []).join(' ').toLowerCase();
      const heart = (product.heartNotes || []).join(' ').toLowerCase();
      const base = (product.baseNotes || []).join(' ').toLowerCase();
      const allNotes = `${top} ${heart} ${base}`;
      const occ = (product.occasion || '').toLowerCase();
      const proj = (product.projection || '').toLowerCase();

      // Mood match
      if (moodVal === 'fresh' && (fam.includes('fresh') || fam.includes('aquatic') || allNotes.includes('lemon') || allNotes.includes('bergamot'))) score += 40;
      if (moodVal === 'warm' && (fam.includes('amber') || fam.includes('oriental') || allNotes.includes('amber') || allNotes.includes('vanilla'))) score += 40;
      if (moodVal === 'woody' && (fam.includes('wood') || fam.includes('oud') || allNotes.includes('wood') || allNotes.includes('cedar'))) score += 40;
      if (moodVal === 'sweet' && (fam.includes('amber') || allNotes.includes('vanilla') || allNotes.includes('tonka'))) score += 40;
      if (moodVal === 'clean' && (fam.includes('floral') || fam.includes('fresh') || allNotes.includes('musk') || allNotes.includes('iris'))) score += 40;

      // Occasion match
      if (occasionVal === 'everyday' && (occ.includes('daily') || product.bestseller)) score += 30;
      if (occasionVal === 'office' && (occ.includes('executive') || occ.includes('office') || occ.includes('daily'))) score += 30;
      if (occasionVal === 'date_night' && (occ.includes('evening') || occ.includes('date') || fam.includes('amber'))) score += 30;
      if (occasionVal === 'evening' && (occ.includes('evening') || fam.includes('wood') || fam.includes('amber'))) score += 30;
      if (occasionVal === 'weekend' && (occ.includes('casual') || occ.includes('weekend') || fam.includes('fresh'))) score += 30;

      // Intensity match
      if (intensityVal === 'subtle' && (proj.includes('subtle') || proj.includes('close'))) score += 20;
      if (intensityVal === 'balanced' && (proj.includes('moderate') || proj.includes('refined'))) score += 20;
      if (intensityVal === 'bold' && (proj.includes('enveloping') || proj.includes('sillage') || fam.includes('oud'))) score += 20;

      return { product, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const winner = scored[0]?.product || products[0];

    const moodNames = { fresh: 'fresh accents', warm: 'warm amber', woody: 'rich woods', sweet: 'sweet notes', clean: 'clean florals' };
    const occNames = { everyday: 'everyday wear', office: 'the office', date_night: 'date nights', evening: 'evening wear', weekend: 'the weekend' };
    const intNames = { subtle: 'a subtle profile', balanced: 'a balanced projection', bold: 'a bolder profile' };

    const reason = `You chose ${moodNames[moodVal] || moodVal}, ${occNames[occasionVal] || occasionVal} and ${intNames[intensityVal] || intensityVal}.`;

    setMatchResult(winner);
    setMatchReason(reason);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setMatchResult(null);
    setMatchReason('');
    trackFeatureEvent('SCENT_FINDER_STARTED', 'scent_finder');
  };

  const handleViewProduct = () => {
    if (matchResult && onSelectProduct) {
      trackFeatureEvent('SCENT_FINDER_RESULT_CLICKED', 'scent_finder', { productId: matchResult.id });
      onSelectProduct(matchResult.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scent-finder-title"
    >
      <div className="relative w-full max-w-xl bg-[#0E1011] border border-[#D8BE82]/30 p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#AAA297] hover:text-[#D8BE82] p-2 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Modal Brand Eyebrow */}
        <div className="text-center space-y-1 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <IllureCrest size={18} className="text-[#C7A866]" />
            <span className="font-bodoni text-base tracking-[0.25em] text-[#F7F3EA] uppercase">
              İLLURÊ
            </span>
          </div>
          <h2 id="scent-finder-title" className="font-bodoni text-xl md:text-2xl text-[#F7F3EA] tracking-wide uppercase pt-1">
            {quizTitle}
          </h2>
        </div>

        {/* QUIZ FLOW */}
        {!matchResult && (
          <div className="space-y-6">
            {/* Step Counter */}
            <div className="flex items-center justify-between text-xs text-[#AAA297] border-b border-[#D8BE82]/15 pb-2">
              <span className="tracking-widest uppercase">QUESTION {currentStep + 1} OF {questions.length}</span>
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

            {/* Question Prompt */}
            <div className="space-y-1">
              <h3 className="font-editorial-serif text-xl md:text-2xl text-[#F7F3EA]">
                {currentQ.prompt}
              </h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  className="w-full text-left p-3.5 bg-[#14120F] border border-[#D8BE82]/20 hover:border-[#D8BE82]/70 hover:bg-[#1A1814] transition-all group flex items-center justify-between focus:outline-none focus:border-[#C7A866]"
                >
                  <div>
                    <span className="text-xs font-semibold tracking-widest text-[#F7F3EA] group-hover:text-[#D8BE82] uppercase block">
                      {opt.label}
                    </span>
                    {opt.explanation && (
                      <span className="text-[11px] text-[#AAA297] font-light block mt-0.5">
                        {opt.explanation}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#C7A866] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MATCH RESULT (HUMAN, CLEAN, NO AI JARGON) */}
        {matchResult && (
          <div className="space-y-6 pt-1 animate-fade-in">
            <div className="text-center space-y-1 border-b border-[#D8BE82]/15 pb-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C7A866] block font-medium">
                YOUR MATCH
              </span>
              <h3 className="font-bodoni text-2xl text-[#F7F3EA]">
                {matchResult.name}
              </h3>
              <p className="text-xs text-[#AAA297]">
                {matchResult.fragranceFamily || 'Master Creation'}
                {matchResult.occasion ? ` · ${matchResult.occasion}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="aspect-square max-h-[180px] mx-auto bg-[#080A0B] border border-[#D8BE82]/15 p-2 overflow-hidden flex items-center justify-center">
                <img
                  src={matchResult.images?.[0]?.url || matchResult.images?.[0] || matchResult.image || '/images/illure-placeholder.svg'}
                  alt={matchResult.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#C7A866] uppercase tracking-wider block font-semibold">
                    WHY IT FITS:
                  </span>
                  <p className="text-[#D8D0C3] text-[11px] leading-relaxed mt-0.5">
                    {matchReason}
                  </p>
                </div>

                {matchResult.topNotes && matchResult.topNotes.length > 0 && (
                  <div>
                    <span className="text-[10px] text-[#C7A866] uppercase tracking-wider block font-semibold">
                      NOTES:
                    </span>
                    <p className="text-[#AAA297] text-[11px] line-clamp-2 mt-0.5">
                      {matchResult.topNotes.slice(0, 3).join(', ')}
                    </p>
                  </div>
                )}

                {matchResult.price && (
                  <div className="pt-1">
                    <span className="text-[10px] text-[#AAA297] block uppercase tracking-wider">Price</span>
                    <span className="font-editorial-serif text-lg text-[#F7F3EA]">
                      ₹{Number(matchResult.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#D8BE82]/15">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 text-xs text-[#AAA297] hover:text-[#F7F3EA] flex items-center justify-center space-x-1.5 transition-colors focus:outline-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="tracking-wider uppercase text-[11px]">RETAKE QUIZ</span>
              </button>

              <button
                onClick={handleViewProduct}
                className="w-full sm:w-auto px-6 py-3 bg-[#C7A866] hover:bg-[#D8BE82] text-[#080A0B] text-xs font-semibold tracking-widest uppercase transition-colors flex items-center justify-center space-x-2 shadow-sm focus:outline-none"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
