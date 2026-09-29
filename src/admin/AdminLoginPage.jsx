import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage({ onLoginSuccess }) {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C0D] flex items-center justify-center p-4 selection:bg-[#C6AE82] selection:text-[#080C0D]">
      <div className="w-full max-w-md bg-[#0D1112] border border-[#C6AE82]/20 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C6AE82]/10 border border-[#C6AE82]/30 mb-4 text-[#C6AE82]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-light tracking-widest text-[#F2EFE8] uppercase">
            İLLURÊ
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#C6AE82] mt-1">
            Admin Portal &amp; Management
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-800/40 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F2EFE8]/70 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C6AE82]/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@illurefragrance.com"
                className="w-full pl-10 pr-4 py-3 bg-[#13191B] border border-[#C6AE82]/20 rounded-lg text-sm text-[#F2EFE8] placeholder-[#F2EFE8]/30 focus:outline-none focus:border-[#C6AE82] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F2EFE8]/70 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C6AE82]/60" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#13191B] border border-[#C6AE82]/20 rounded-lg text-sm text-[#F2EFE8] placeholder-[#F2EFE8]/30 focus:outline-none focus:border-[#C6AE82] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-[#C6AE82] hover:bg-[#B38E46] text-[#080C0D] font-medium text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            {!submitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#C6AE82]/10 text-center">
          <p className="text-[10px] uppercase tracking-wider text-[#F2EFE8]/40">
            Protected Admin System • Argon2id Secured
          </p>
        </div>
      </div>
    </div>
  );
}
