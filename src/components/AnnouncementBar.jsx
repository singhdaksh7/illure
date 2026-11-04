import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { isSafeUrl } from '../utils/urlSafety';

export default function AnnouncementBar({ onNavigate }) {
  const { announcement } = useCms();
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || !announcement.isEnabled || !announcement.text || dismissed) {
    return null;
  }

  const handleClick = () => {
    if (announcement.linkUrl && isSafeUrl(announcement.linkUrl)) {
      if (announcement.linkUrl.startsWith('#') && onNavigate) {
        const target = announcement.linkUrl.replace('#', '');
        onNavigate(target === 'catalog' ? 'shop' : target);
      } else if (announcement.linkUrl.startsWith('http')) {
        window.open(announcement.linkUrl, '_blank');
      }
    }
  };

  return (
    <div className="relative bg-[#121214] border-b border-[#B89A62]/25 text-[#F7F4EE] z-50 text-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-2.5 text-center">
          <Sparkles className="w-3.5 h-3.5 text-[#B89A62] animate-pulse shrink-0 hidden sm:inline" />
          <span 
            onClick={handleClick}
            className={`font-interface-sans font-light tracking-widest text-[11px] md:text-xs uppercase text-[#E3DCD0] ${
              announcement.linkUrl ? 'cursor-pointer hover:text-[#B89A62] transition-colors underline-offset-4 hover:underline' : ''
            }`}
          >
            {announcement.text}
          </span>
          {announcement.linkUrl && (
            <ArrowRight className="w-3 h-3 text-[#B89A62] inline-block ml-1" />
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#A1A1AA] hover:text-[#F7F4EE] transition-colors p-1"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      </div>
    </div>
  );
}

