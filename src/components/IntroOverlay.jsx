import React, { useState, useEffect } from 'react';
import IllureCrest from './IllureCrest';

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.4s
    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 1400);

    // Hide completely after 2.0s
    const timer2 = setTimeout(() => {
      setVisible(false);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#080C0D] flex flex-col items-center justify-center transition-opacity duration-700 select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-[#B89A62]/20 rounded-full blur-3xl animate-pulse" />
          <IllureCrest className="w-36 h-auto relative z-10" color="#B89A62" />
        </div>

        <div className="text-center pt-2">
          <h1 className="font-bodoni text-3xl md:text-4xl tracking-[0.4em] text-[#F2EFE8] uppercase">
            İLLURÊ
          </h1>
          <span className="font-interface-sans text-[10px] tracking-[0.5em] text-[#B89A62] uppercase font-medium mt-1 block">
            FRAGRANCE
          </span>
        </div>
      </div>
    </div>
  );
}
