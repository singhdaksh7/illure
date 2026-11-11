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

  const title = section?.title || 'STAY IN THE LOOP';
  const subtitle = section?.subtitle || 'DROPS & RESTOCKS';
  const description = section?.description || 'New releases. Restocks. Offers worth opening.';

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
      className="py-28 md:py-36 bg-[#080A0B] border-b border-[#D8BE82]/15 relative select-none overflow-hidden"
    >
      {/* Background warm glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C7A866]/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
        
        <div className="flex items-center justify-center space-x-3">
          <span className="w-8 h-[1px] bg-[#C7A866]" />
          <span className="typography-eyebrow">
            {subtitle}
          </span>
          <span className="w-8 h-[1px] bg-[#C7A866]" />
        </div>

        <h2 className="typography-display text-[#F7F3EA]">
          {title}
        </h2>

        <p className="typography-body max-w-md mx-auto text-[#D8D0C3]">
          {description}
        </p>

        {/* Minimal Integrated Form */}
        <div className="pt-4 max-w-md mx-auto">
          {submitted ? (
            <div className="flex items-center justify-center space-x-2.5 p-4 border border-[#D8BE82] bg-[#14120F] text-[#D8BE82] rounded-xs animate-fade-up">
              <CheckCircle2 className="w-4 h-4 text-[#D8BE82]" />
              <span className="text-xs tracking-widest uppercase font-medium">
                YOU’RE ON THE LIST.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL" 
                className="flex-1 bg-[#14120F] border border-[#D8BE82]/30 px-5 py-3.5 text-xs font-interface-sans tracking-widest text-[#F7F3EA] placeholder-[#D8D0C3]/50 focus:outline-none focus:border-[#D8BE82] transition-colors rounded-xs"
              />
              
              <button 
                type="submit"
                className="px-7 py-3.5 bg-[#D8BE82] hover:bg-[#C7A866] text-[#080A0B] font-interface-sans text-xs tracking-[0.25em] font-semibold uppercase transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap rounded-xs shadow-[0_5px_15px_rgba(216,190,130,0.15)]"
              >
                <span>JOIN</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#080A0B]" />
              </button>
            </form>
          )}
        </div>

        <p className="text-[11px] text-[#D8D0C3]/70 tracking-wider">
          No spam, ever. Unsubscribe anytime.
        </p>

      </div>
    </section>
  );
}
