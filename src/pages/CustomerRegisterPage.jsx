import React, { useState } from 'react';
import { User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

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
      onNavigate('account');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C0D] pt-32 pb-24 text-[#F2EFE8] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#101617] border border-white/[0.08] p-8 md:p-10 rounded-xs space-y-8 shadow-2xl">
        
        <div className="text-center space-y-2">
          <span className="font-interface-sans text-[10px] tracking-[0.35em] text-[#B89A62] uppercase font-semibold">
            BECOME AN İLLURÊ CLIENT
          </span>
          <h1 className="font-editorial-serif text-3xl font-light text-[#F2EFE8]">
            Create Account
          </h1>
          <p className="font-interface-sans text-xs text-[#8F9897] font-light">
            Register for a personalized luxury fragrance experience.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-interface-sans rounded-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-interface-sans text-[10px] tracking-widest text-[#8F9897] uppercase">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8F9897] absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-[#080C0D] border border-white/[0.1] rounded-xs py-3 pl-10 pr-4 text-xs font-interface-sans text-[#F2EFE8] placeholder-[#8F9897]/50 focus:outline-none focus:border-[#B89A62]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-interface-sans text-[10px] tracking-widest text-[#8F9897] uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8F9897] absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full bg-[#080C0D] border border-white/[0.1] rounded-xs py-3 pl-10 pr-4 text-xs font-interface-sans text-[#F2EFE8] placeholder-[#8F9897]/50 focus:outline-none focus:border-[#B89A62]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-interface-sans text-[10px] tracking-widest text-[#8F9897] uppercase">
              Mobile Number (10 Digits)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8F9897] absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-[#080C0D] border border-white/[0.1] rounded-xs py-3 pl-10 pr-4 text-xs font-interface-sans text-[#F2EFE8] placeholder-[#8F9897]/50 focus:outline-none focus:border-[#B89A62]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-interface-sans text-[10px] tracking-widest text-[#8F9897] uppercase">
              Password (Min 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8F9897] absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080C0D] border border-white/[0.1] rounded-xs py-3 pl-10 pr-4 text-xs font-interface-sans text-[#F2EFE8] placeholder-[#8F9897]/50 focus:outline-none focus:border-[#B89A62]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#B89A62] hover:bg-[#C0A46D] text-[#080C0D] font-interface-sans text-xs font-bold tracking-[0.25em] uppercase transition-all duration-300 rounded-xs cursor-pointer disabled:opacity-50 mt-4"
          >
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div className="pt-6 border-t border-white/[0.08] text-center space-y-3 font-interface-sans text-xs">
          <p className="text-[#8F9897]">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#B89A62] hover:underline font-semibold cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
