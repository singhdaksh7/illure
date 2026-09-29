import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <section className="py-24 md:py-36 bg-[#080C0D] border-t border-white/[0.05] relative select-none">
      
      <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
        
        <span className="font-interface-sans text-[10px] tracking-[0.35em] text-[#B89A62] uppercase font-medium">
          PRIVILEGED ACCESS
        </span>

        <h3 className="font-editorial-serif text-4xl sm:text-6xl text-[#F2EFE8] font-light tracking-tight">
          ENTER THE <br />
          <span className="italic font-normal text-[#B89A62]">WORLD OF İLLURÊ.</span>
        </h3>

        <p className="font-interface-sans text-xs sm:text-sm text-[#8F9897] font-light max-w-md mx-auto leading-relaxed">
          New fragrances, private selections and stories delivered occasionally.
        </p>

        {/* EMAIL INPUT FORM */}
        <div className="pt-4 max-w-lg mx-auto">
          {submitted ? (
            <div className="flex items-center justify-center space-x-3 p-4 border border-[#B89A62]/40 bg-[#101617] text-[#B89A62]">
              <CheckCircle2 className="w-5 h-5 text-[#B89A62]" />
              <span className="font-interface-sans text-xs tracking-widest uppercase">
                WELCOME TO İLLURÊ PRIVATE CIRCLE
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL ADDRESS" 
                className="flex-1 bg-[#101617] border border-white/[0.1] px-5 py-4 text-xs font-interface-sans tracking-widest text-[#F2EFE8] placeholder-[#8F9897]/60 focus:outline-none focus:border-[#B89A62] transition-colors"
              />
              
              <button 
                type="submit"
                className="group px-8 py-4 bg-[#161C1D] border border-white/[0.15] hover:border-[#B89A62] text-[#F2EFE8] font-interface-sans text-[11px] tracking-[0.25em] uppercase transition-all duration-300 hover:bg-[#101617] flex items-center justify-center space-x-3 whitespace-nowrap"
              >
                <span>JOIN THE LIST</span>
                <ArrowRight className="w-4 h-4 text-[#B89A62] group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </div>

      </div>

    </section>
  );
}
