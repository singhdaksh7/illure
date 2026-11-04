import React from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import IllureCrest from '../components/IllureCrest';

export default function NotFoundPage({ onGoHome }) {
  return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center px-6 select-none relative overflow-hidden">
      
      {/* Background radial gold aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] bg-[#B89A62]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-xl mx-auto text-center space-y-8 relative z-10 animate-fade-up">
        
        <div className="flex flex-col items-center space-y-3">
          <IllureCrest size={48} className="text-[#B89A62] opacity-80" />
          <span className="typography-eyebrow text-[10px]">
            ARCHIVE 404
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="typography-display-xl text-[#F7F4EE]">
            THE SCENT HAS FADED.
          </h1>
          <p className="typography-body text-[#A1A1AA] max-w-sm mx-auto text-xs sm:text-sm">
            The formulation or archive destination you sought is no longer present in our private inventory.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onGoHome}
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-[#B89A62] hover:bg-[#C0A46D] text-[#0B0B0C] font-semibold text-xs tracking-[0.28em] uppercase transition-all duration-300 rounded-xs shadow-[0_10px_25px_rgba(184,154,98,0.2)]"
          >
            <ArrowLeft className="w-4 h-4 text-[#0B0B0C] group-hover:-translate-x-1 transition-transform" />
            <span>RETURN TO COLLECTION</span>
          </button>
        </div>

      </div>
    </div>
  );
}

