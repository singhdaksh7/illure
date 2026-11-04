import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCms } from '../context/CmsContext';

export default function NewsletterSection() {
  const { getSection } = useCms();
  const section = getSection('newsletter');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (section && !section.isEnabled) {
    return null;
  }

  const title = section?.title || 'PRIVATE NOTES FROM İLLURÊ';
  const subtitle = section?.subtitle || 'MEMBERS PRIVILEGE';
  const description = section?.description || 'Receive confidential releases, private drop alerts, and bespoke formulation previews directly to your inbox.';

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
    <section 
      id="newsletter-section" 
      className="py-24 md:py-32 bg-[#0B0B0C] border-b border-white/[0.04] relative select-none"
    >
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        
        <div className="flex items-center justify-center space-x-3">
          <span className="w-8 h-[1px] bg-[#B89A62]" />
          <span className="typography-eyebrow">
            {subtitle}
          </span>
          <span className="w-8 h-[1px] bg-[#B89A62]" />
        </div>

        <h2 className="typography-display text-[#F7F4EE]">
          {title}
        </h2>

        <p className="typography-body max-w-md mx-auto text-[#A1A1AA]">
          {description}
        </p>

        {/* Minimal Integrated Form */}
        <div className="pt-4 max-w-md mx-auto">
          {submitted ? (
            <div className="flex items-center justify-center space-x-2.5 p-4 border border-[#B89A62] bg-[#121214] text-[#B89A62] rounded-xs animate-fade-up">
              <CheckCircle2 className="w-4 h-4 text-[#B89A62]" />
              <span className="text-xs tracking-widest uppercase font-medium">
                INSCRIBED INTO THE İLLURÊ DISPATCH
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
                className="flex-1 bg-[#121214] border border-white/[0.1] px-5 py-3.5 text-xs font-interface-sans tracking-widest text-[#F7F4EE] placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#B89A62] transition-colors rounded-xs"
              />
              
              <button 
                type="submit"
                className="px-7 py-3.5 bg-[#B89A62] hover:bg-[#C0A46D] text-[#0B0B0C] font-interface-sans text-xs tracking-[0.25em] font-semibold uppercase transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap rounded-xs shadow-[0_5px_15px_rgba(184,154,98,0.15)]"
              >
                <span>INSCRIBE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0B0B0C]" />
              </button>
            </form>
          )}
        </div>

        <p className="text-[10px] text-[#A1A1AA]/60 tracking-wider">
          We honor discretion. No spam, ever. Unsubscribe with a single click.
        </p>

      </div>
    </section>
  );
}
