import React from 'react';
import IllureCrest from './IllureCrest';

export default function FooterSection({ onNavigate }) {
  return (
    <footer className="relative bg-[#080C0D] border-t border-white/[0.08] pt-24 pb-12 overflow-hidden select-none">
      
      {/* VERY LARGE FADED BACKGROUND WORDMARK "İLLURÊ" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none w-full overflow-hidden text-center opacity-10">
        <span className="font-bodoni text-[24vw] leading-none text-[#F2EFE8]/[0.04] tracking-[0.15em] uppercase font-light">
          İLLURÊ
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* PROMINENT CREST & BRAND IMPRESSION AT FOOTER TOP */}
        <div className="flex flex-col items-center justify-center text-center pb-16 border-b border-white/[0.08]">
          <div className="relative group cursor-pointer mb-5">
            <div className="absolute inset-0 bg-[#B89A62]/10 rounded-full blur-2xl group-hover:bg-[#B89A62]/20 transition-all duration-700" />
            <IllureCrest className="w-32 sm:w-40 h-auto relative z-10 transition-transform duration-700 group-hover:scale-105" color="#B89A62" />
          </div>

          <h2 className="font-bodoni text-3xl sm:text-4xl text-[#F2EFE8] font-light tracking-[0.35em] uppercase">
            İLLURÊ
          </h2>
          <span className="font-interface-sans text-xs tracking-[0.45em] text-[#B89A62] uppercase font-medium mt-1">
            FRAGRANCE
          </span>
          <p className="font-editorial-serif italic text-lg sm:text-xl text-[#F2EFE8]/80 mt-4 font-light">
            “Leave an impression.”
          </p>
        </div>

        {/* FOOTER NAVIGATION COLUMNS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 py-16 border-b border-white/[0.08]">
          
          {/* SHOP */}
          <div className="space-y-4">
            <h5 className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-semibold">
              COLLECTIONS
            </h5>
            <ul className="space-y-2.5 font-interface-sans text-xs text-[#8F9897] font-light">
              <li>
                <button onClick={() => onNavigate && onNavigate('shop', 'Him')} className="hover:text-[#F2EFE8] transition-colors">
                  For Him
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('shop', 'Her')} className="hover:text-[#F2EFE8] transition-colors">
                  For Her
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('shop', null, 'niche')} className="hover:text-[#F2EFE8] transition-colors">
                  Niche Reserve
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('shop')} className="hover:text-[#F2EFE8] transition-colors">
                  Signature Bestsellers
                </button>
              </li>
            </ul>
          </div>

          {/* İLLURÊ */}
          <div className="space-y-4">
            <h5 className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-semibold">
              İLLURÊ MAISON
            </h5>
            <ul className="space-y-2.5 font-interface-sans text-xs text-[#8F9897] font-light">
              <li>
                <button onClick={() => onNavigate && onNavigate('home')} className="hover:text-[#F2EFE8] transition-colors">
                  Brand Story & Heritage
                </button>
              </li>
              <li>
                <span className="hover:text-[#F2EFE8] transition-colors cursor-pointer">
                  Private Concierge
                </span>
              </li>
              <li>
                <span className="hover:text-[#F2EFE8] transition-colors cursor-pointer">
                  Certificate of Authenticity
                </span>
              </li>
            </ul>
          </div>

          {/* ASSISTANCE */}
          <div className="space-y-4">
            <h5 className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-semibold">
              CLIENT SERVICES
            </h5>
            <ul className="space-y-2.5 font-interface-sans text-xs text-[#8F9897] font-light">
              <li><span className="hover:text-[#F2EFE8] transition-colors cursor-pointer">Insured White-Glove Shipping</span></li>
              <li><span className="hover:text-[#F2EFE8] transition-colors cursor-pointer">Complimentary Returns</span></li>
              <li><span className="hover:text-[#F2EFE8] transition-colors cursor-pointer">Olfactory Consultations</span></li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div className="space-y-4">
            <h5 className="font-interface-sans text-[10px] tracking-[0.3em] text-[#B89A62] uppercase font-semibold">
              SOCIAL & PRIVATE CIRCLE
            </h5>
            <ul className="space-y-2.5 font-interface-sans text-xs text-[#8F9897] font-light">
              <li><a href="#" className="hover:text-[#F2EFE8] transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-[#F2EFE8] transition-colors">Exclusive Private Registry</a></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-interface-sans text-[#8F9897]/70 space-y-4 sm:space-y-0">
          <p>© 2026 İLLURÊ FRAGRANCE. ALL RIGHTS RESERVED.</p>
          
          <div className="flex items-center space-x-6">
            <span className="hover:text-[#F2EFE8] transition-colors cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-[#F2EFE8] transition-colors cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-[#F2EFE8] transition-colors cursor-pointer">Haute Parfumerie</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
