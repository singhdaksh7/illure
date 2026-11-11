import React from 'react';
import IllureCrest from './IllureCrest';
import { useCms } from '../context/CmsContext';
import { MessageCircle, Mail, Phone, ShieldCheck } from 'lucide-react';

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const isValidWhatsApp = (number) => {
  if (!number || typeof number !== 'string') return false;
  const digits = number.replace(/[^0-9]/g, '');
  if (digits.length < 10) return false;
  if (digits.includes('9876543210') || digits.includes('1234567890')) return false;
  return true;
};

const isValidSocialUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 5 && trimmed !== '#' && (trimmed.startsWith('https://') || trimmed.startsWith('http://'));
};

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  return trimmed.length > 3 && trimmed.includes('@') && !trimmed.includes('example.com') && !trimmed.includes('dummy');
};

const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.length >= 10 && !['1234567890', '9876543210', '0000000000'].includes(cleaned);
};

export default function FooterSection({ onNavigate }) {
  const { footer, brandContacts } = useCms();

  const handleLinkClick = (href) => {
    if (!href) return;
    if (href === '#catalog' || href === '#bestsellers' || href === '#new-arrivals') {
      if (onNavigate) onNavigate('shop');
    } else if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
      window.open(href, '_blank');
    }
  };

  const columns = footer?.columns || [
    {
      title: 'SHOP',
      links: [
        { label: 'All Fragrances', href: '#catalog' },
        { label: 'Bestsellers', href: '#bestsellers' },
        { label: 'New Arrivals', href: '#new-arrivals' },
        { label: 'Gift Packaging', href: '#catalog' }
      ]
    },
    {
      title: 'DISCOVER',
      links: [
        { label: 'The İLLURÊ Story', href: '#brand-story' },
        { label: 'Fragrance Notes', href: '#collections' },
        { label: 'Shop By Mood', href: '#mood' },
        { label: 'Why İLLURÊ', href: '#authenticity' }
      ]
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Order Tracking', href: '#orders' },
        { label: 'Shipping & Delivery', href: '#shipping' },
        { label: 'FAQ & Sizing', href: '#faq' },
        { label: 'Concierge', href: `mailto:${brandContacts?.email || 'concierge@illurefragrance.com'}` }
      ]
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Refund Policy', href: '#refunds' },
        { label: 'Why İLLURÊ', href: '#authenticity' }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-[#080A0B] via-[#0E1011] to-[#080909] border-t border-[#D8BE82]/20 text-[#F7F3EA] select-none pt-24 pb-12 relative overflow-hidden">
      
      {/* 1. PRE-FOOTER CALLOUT */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pb-20 border-b border-[#D8BE82]/15">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-[#14120F] border border-[#D8BE82]/25 p-8 md:p-12 rounded-xs relative overflow-hidden shadow-2xl">
          {/* Subtle gold glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#C7A866]/[0.05] rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10 max-w-xl">
            <span className="typography-eyebrow text-[9px] text-[#D8BE82]">
              FIND YOUR PROFILE
            </span>
            <h3 className="font-editorial-serif text-3xl md:text-4xl text-[#F7F3EA] font-light leading-tight">
              YOUR NEXT SIGNATURE IS WAITING.
            </h3>
            <p className="typography-body text-xs md:text-sm text-[#D8D0C3]">
              Extrait de parfum formulations. Clean notes, high character, designed to be worn every day.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('shop')}
              className="btn-primary-gold"
            >
              <span>EXPLORE FRAGRANCES</span>
              <span className="text-[#080A0B]">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-16 relative z-10">
        
        {/* Top: Brand Identity & Tagline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#D8BE82]/15">
          
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center space-x-3">
              <IllureCrest size={28} className="text-[#D8BE82]" />
              <span className="font-bodoni text-2xl tracking-[0.3em] uppercase text-[#F7F3EA]">
                İLLURÊ
              </span>
            </div>

            <p className="font-editorial-serif text-lg text-[#F7F3EA] italic font-light max-w-sm">
              {footer?.tagline || 'Scent, without the noise. Familiar inspiration, our own identity.'}
            </p>

            <div className="space-y-1.5 text-xs text-[#D8D0C3] font-interface-sans font-light">
              <div className="flex items-center space-x-2">
                <span className="text-[#D8BE82] font-medium">İLLURÊ:</span>
                <span>Contemporary Fragrance Label</span>
              </div>
              {isValidPhone(brandContacts?.phone) && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#D8BE82]" />
                  <span>{brandContacts.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="font-interface-sans text-[10px] tracking-[0.3em] uppercase text-[#D8BE82] font-semibold">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-xs text-[#D8D0C3] hover:text-[#D8BE82] font-interface-sans font-light tracking-wider transition-colors text-left"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* 2. OVERSIZED FAINT OUTLINE 'İLLURÊ' WORDMARK WATERMARK */}
        <div className="py-10 flex justify-center pointer-events-none select-none overflow-hidden">
          <span 
            className="font-bodoni font-light uppercase tracking-[0.2em] leading-none text-center"
            style={{
              fontSize: 'clamp(4.5rem, 14vw, 13rem)',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(216, 190, 130, 0.22)',
              opacity: 0.85,
            }}
          >
            İLLURÊ
          </span>
        </div>

        {/* Bottom: Socials, Certifications & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#D8BE82]/15">
          
          {/* Social Channels */}
          <div className="flex items-center space-x-5 text-[#D8D0C3]">
            {isValidSocialUrl(brandContacts?.instagram) && (
              <a 
                href={brandContacts.instagram} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-[#D8BE82] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {isValidSocialUrl(brandContacts?.facebook) && (
              <a 
                href={brandContacts.facebook} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-[#D8BE82] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
            {isValidWhatsApp(brandContacts?.whatsapp) && (
              <a 
                href={`https://wa.me/${brandContacts.whatsapp.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-[#D8BE82] transition-colors"
                aria-label="WhatsApp Concierge"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {isValidEmail(brandContacts?.email) && (
              <a 
                href={`mailto:${brandContacts.email}`} 
                className="hover:text-[#D8BE82] transition-colors"
                aria-label="Email Concierge"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Payment Badges (Subtle & Quiet Luxury) */}
          <div className="flex items-center space-x-3 text-[10px] tracking-widest uppercase font-mono text-[#D8D0C3]/80">
            <span>UPI</span>
            <span>·</span>
            <span>VISA</span>
            <span>·</span>
            <span>MASTERCARD</span>
            <span>·</span>
            <span>NETBANKING</span>
            <span>·</span>
            <span>COD</span>
          </div>

          {/* Copyright */}
          <div className="text-[11px] text-[#D8D0C3] font-light">
            {footer?.copyright || '© 2026 İLLURÊ FRAGRANCE. All rights reserved.'}
          </div>

        </div>

        {/* Reference Brand Legal Disclaimer (Requirement 10) */}
        <div className="pt-8 mt-8 border-t border-[#D8BE82]/10 text-center md:text-left">
          <p className="text-[11px] text-[#F7F3EA]/60 leading-relaxed max-w-4xl font-light">
            {footer?.disclaimer || 'Reference brand names are used only to describe fragrance inspiration and olfactory reference. İLLURÊ FRAGRANCE is an independent brand and is not affiliated with, endorsed by, or sponsored by the referenced trademark owners.'}
          </p>
        </div>

      </div>
    </footer>
  );
}
