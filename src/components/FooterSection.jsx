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
        { label: 'The House of İLLURÊ', href: '#brand-story' },
        { label: 'Fragrance Notes', href: '#collections' },
        { label: 'Shop By Mood', href: '#mood' },
        { label: 'Authenticity Guarantee', href: '#authenticity' }
      ]
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Order Tracking', href: '#orders' },
        { label: 'Shipping & Delivery', href: '#shipping' },
        { label: 'FAQ & Sizing', href: '#faq' },
        { label: 'Concierge Support', href: `mailto:${brandContacts?.email || 'concierge@illurefragrance.com'}` }
      ]
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Refund Policy', href: '#refunds' },
        { label: 'Authenticity Pledge', href: '#authenticity' }
      ]
    }
  ];

  return (
    <footer className="bg-[#0B0B0C] border-t border-white/[0.06] text-[#F7F4EE] select-none pt-20 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Top: Brand Identity & Tagline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/[0.06]">
          
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center space-x-3">
              <IllureCrest size={28} className="text-[#B89A62]" />
              <span className="font-bodoni text-2xl tracking-[0.3em] uppercase text-[#F7F4EE]">
                İLLURÊ
              </span>
            </div>

            <p className="font-editorial-serif text-lg text-[#F7F4EE]/90 italic font-light max-w-sm">
              {footer?.tagline || 'Haute Parfumerie. Hand-blended extracts inspired by icons of perfumery.'}
            </p>

            <div className="space-y-1.5 text-xs text-[#A1A1AA] font-interface-sans font-light">
              <div className="flex items-center space-x-2">
                <span className="text-[#B89A62]">Atelier:</span>
                <span>Parisian Formulation · Hand-Poured in India</span>
              </div>
              {brandContacts?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-[#B89A62]" />
                  <span>{brandContacts.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="font-interface-sans text-[10px] tracking-[0.3em] uppercase text-[#B89A62] font-semibold">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <button
                        onClick={() => handleLinkClick(link.href)}
                        className="text-xs text-[#A1A1AA] hover:text-[#F7F4EE] font-interface-sans font-light tracking-wider transition-colors text-left"
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

        {/* Bottom: Socials, Certifications & Copyright */}
        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Social Channels */}
          <div className="flex items-center space-x-5 text-[#A1A1AA]">
            {brandContacts?.instagram && (
              <a 
                href={brandContacts.instagram} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-[#B89A62] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {brandContacts?.facebook && (
              <a 
                href={brandContacts.facebook} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-[#B89A62] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
            {brandContacts?.whatsapp && (
              <a 
                href={`https://wa.me/${brandContacts.whatsapp.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-[#B89A62] transition-colors"
                aria-label="WhatsApp Concierge"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {brandContacts?.email && (
              <a 
                href={`mailto:${brandContacts.email}`} 
                className="hover:text-[#B89A62] transition-colors"
                aria-label="Email Concierge"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Payment Badges (Subtle & Quiet Luxury) */}
          <div className="flex items-center space-x-3 text-[10px] tracking-widest uppercase font-mono text-[#A1A1AA]/70">
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
          <div className="text-[11px] text-[#A1A1AA]/70 font-light">
            {footer?.copyright || '© 2026 İLLURÊ FRAGRANCE. All rights reserved.'}
          </div>

        </div>

      </div>
    </footer>
  );
}
