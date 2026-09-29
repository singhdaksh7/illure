import React from 'react';
import { ArrowRight, Quote } from 'lucide-react';

export default function EditorialStory({ onOpenPhilosophy }) {
  return (
    <section className="py-24 bg-[#080C0D] border-t border-white/5 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Cinematic High-Fashion Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative h-[520px] sm:h-[600px] w-full rounded-sm overflow-hidden border border-white/10 group shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200" 
                alt="The Language of Fragrance"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080C0D] via-transparent to-black/30" />
              
              {/* Floating Quote Card */}
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-[#101617]/90 backdrop-blur-md border border-white/10 rounded-xs">
                <Quote className="w-6 h-6 text-[#B89A62] mb-2" />
                <p className="font-bodoni italic text-base sm:text-lg text-[#F2EFE8] font-normal">
                  "Leave an impression before you say a word."
                </p>
                <span className="font-interface-sans text-[10px] tracking-[0.25em] text-[#8F9897] uppercase mt-2 block">
                  — THE İLLURÊ PHILOSOPHY
                </span>
              </div>
            </div>
          </div>

          {/* Right: Editorial Typography & Copy */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left space-y-8 lg:pl-6">
            <div>
              <span className="font-interface-sans text-xs font-semibold tracking-[0.3em] text-[#B89A62] uppercase block mb-2">
                THE ESSENCE OF İLLURÊ
              </span>
              <h2 className="font-editorial-serif text-3xl sm:text-5xl text-[#F2EFE8] font-light leading-[1.1] tracking-wide">
                THE LANGUAGE OF <br />
                <span className="font-bodoni italic text-gold-gradient">FRAGRANCE</span>
              </h2>
            </div>

            <div className="space-y-6 text-[#8F9897] font-interface-sans text-sm sm:text-base font-light leading-relaxed tracking-wide">
              <p>
                A fragrance is more than something you wear. It becomes an extension of your spirit, an invisible signature that lingers long after you leave the room. It becomes part of how people remember you.
              </p>
              <p>
                At <strong className="text-[#F2EFE8] font-medium">İLLURÊ FRAGRANCE</strong>, every fragrance is selected for its craftsmanship, character, noble origin, and ability to leave an indelible, lasting impression. We honor the heritage of haute parfumerie while curating for the discerning modern palette.
              </p>
            </div>

            <div className="pt-4">
              <button 
                onClick={onOpenPhilosophy}
                className="group flex items-center space-x-3 text-xs font-interface-sans font-bold tracking-[0.25em] text-[#F2EFE8] hover:text-[#B89A62] transition-colors uppercase py-2 border-b border-[#B89A62]"
              >
                <span>OUR PHILOSOPHY</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#B89A62]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
