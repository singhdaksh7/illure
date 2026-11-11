import React, { useState } from 'react';
import { User, Mail, Phone, Lock, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import IllureCrest from '../components/IllureCrest';

export default function CustomerRegisterPage({ onNavigate }) {
  const { register } = useCustomerAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, phone, password);
      if (onNavigate) onNavigate('account');
    } catch (err) {
      setError(err.message || 'Failed to create patron account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F7F4EE] select-none flex flex-col justify-between">
      
      {/* Top Simple Bar */}
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 pt-8 pb-4 flex items-center justify-between z-20">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="group inline-flex items-center space-x-2 text-xs font-interface-sans tracking-[0.25em] text-[#A1A1AA] hover:text-[#F7F4EE] uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO İLLURÊ</span>
        </button>

        <div className="flex items-center space-x-2">
          <IllureCrest size={20} className="text-[#B89A62]" />
          <span className="font-bodoni text-lg tracking-[0.3em] uppercase text-[#F7F4EE]">
            İLLURÊ
          </span>
        </div>
      </div>

      {/* Main Split Screen Container */}
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-10 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full items-center">
          
          {/* Left Column (Desktop Only): Editorial Campaign Art */}
          <div className="hidden lg:block lg:col-span-6 relative h-[650px] rounded-xs overflow-hidden border border-[#B89A62]/20 group">
            <img 
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200" 
              alt="İLLURÊ Registration" 
              className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1] group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-black/40 opacity-80" />

            <div className="absolute bottom-10 left-10 right-10 space-y-3">
              <span className="typography-eyebrow text-[9px] text-[#B89A62]">
                MEMBERSHIP
              </span>
              <blockquote className="font-editorial-serif text-3xl text-[#F7F4EE] leading-tight italic">
                “Familiar notes. Our point of view.”
              </blockquote>
              <p className="text-xs text-[#A1A1AA] tracking-wider uppercase font-mono">
                İLLURÊ FRAGRANCE
              </p>
            </div>
          </div>

          {/* Right Column: Clean Luxury Registration Form */}
          <div className="lg:col-span-6 max-w-md mx-auto w-full bg-[#121214] border border-[#B89A62]/25 p-8 sm:p-10 rounded-xs space-y-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            
            <div className="space-y-1.5">
              <span className="typography-eyebrow">
                PATRON REGISTRATION
              </span>
              <h1 className="typography-h2 text-[#F7F4EE]">
                Inscribe Your Name
              </h1>
              <p className="typography-body text-xs text-[#A1A1AA]">
                Register for private allocation alerts, expedited order fulfillment, and personalized scent consultation.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-interface-sans rounded-xs flex items-center space-x-2 animate-fade-up">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] tracking-widest text-[#B89A62] uppercase block font-medium">
                  FULL NAME
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Julian Sterling"
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] rounded-xs py-3 pl-10 pr-4 text-xs font-interface-sans text-[#F7F4EE] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#B89A62] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-widest text-[#B89A62] uppercase block font-medium">
                  PRIMARY EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@example.com"
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] rounded-xs py-3 pl-10 pr-4 text-xs font-interface-sans text-[#F7F4EE] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#B89A62] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-widest text-[#B89A62] uppercase block font-medium">
                  MOBILE NUMBER (FOR DISPATCH TRACKING)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] rounded-xs py-3 pl-10 pr-4 text-xs font-interface-sans text-[#F7F4EE] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#B89A62] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] tracking-widest text-[#B89A62] uppercase block font-medium">
                  SECURE PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-[#0B0B0C] border border-white/[0.1] rounded-xs py-3 pl-10 pr-4 text-xs font-interface-sans text-[#F7F4EE] placeholder-[#A1A1AA]/40 focus:outline-none focus:border-[#B89A62] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#B89A62] hover:bg-[#C0A46D] text-[#0B0B0C] font-interface-sans text-xs font-semibold tracking-[0.28em] uppercase transition-all duration-300 rounded-xs cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 shadow-[0_5px_20px_rgba(184,154,98,0.2)] mt-2"
              >
                <span>{loading ? 'CREATING PATRON ACCOUNT...' : 'INSCRIBE & CONTINUE'}</span>
                <ArrowRight className="w-4 h-4 text-[#0B0B0C]" />
              </button>
            </form>

            <div className="pt-5 border-t border-white/[0.08] text-center space-y-2 text-xs">
              <p className="text-[#A1A1AA]">
                Already hold an İLLURÊ account?{' '}
                <button
                  onClick={() => onNavigate && onNavigate('login')}
                  className="text-[#B89A62] hover:underline font-semibold cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Minimal Copyright */}
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-12 py-6 text-center text-[10px] tracking-widest text-[#A1A1AA]/60 uppercase border-t border-white/[0.04]">
        © 2026 İLLURÊ FRAGRANCE · ALL PATRON DATA IS CONFIDENTIAL
      </div>

    </div>
  );
}
