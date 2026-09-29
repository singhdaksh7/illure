import React from 'react';

/**
 * Authentic İLLURÊ FRAGRANCE Crest / Emblem Component
 * Crafted to match the physical packaging brand identity.
 */
export default function IllureCrest({ 
  className = "w-48 h-auto", 
  color = "#B89A62", 
  showBackground = false,
  variant = "full" // "full" | "simplified" | "header"
}) {
  if (variant === "simplified") {
    return (
      <svg 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="İLLURÊ Emblem"
      >
        {/* Outer Circular Frame with Arch Tips */}
        <circle cx="100" cy="100" r="92" stroke={color} strokeWidth="2.5" />
        <circle cx="100" cy="100" r="84" stroke={color} strokeWidth="1.2" />
        
        {/* Top/Bottom Arch Points */}
        <path d="M 92 8 L 100 0 L 108 8" stroke={color} strokeWidth="2" fill="none" />
        <path d="M 92 192 L 100 200 L 108 192" stroke={color} strokeWidth="2" fill="none" />

        {/* Flame motif at top */}
        <path d="M 100 32 C 104 38 108 46 108 52 C 108 57 104 61 100 61 C 96 61 92 57 92 52 C 92 46 96 38 100 32 Z" fill={color} />
        
        {/* Center İLLURÊ */}
        <text 
          x="100" 
          y="108" 
          textAnchor="middle" 
          fill={color} 
          style={{
            fontFamily: "'Bodoni Moda', 'Cormorant Garamond', Didot, serif",
            fontSize: "26px",
            fontWeight: "400",
            letterSpacing: "0.25em"
          }}
        >
          İLLURÊ
        </text>

        {/* FRAGRANCE Subtext */}
        <text 
          x="100" 
          y="132" 
          textAnchor="middle" 
          fill={color} 
          style={{
            fontFamily: "'Manrope', 'Inter', sans-serif",
            fontSize: "10px",
            fontWeight: "600",
            letterSpacing: "0.45em"
          }}
        >
          FRAGRANCE
        </text>

        {/* Lower Drop */}
        <path d="M 100 148 C 103 153 104 157 100 162 C 96 157 97 153 100 148 Z" fill={color} />
      </svg>
    );
  }

  return (
    <svg 
      viewBox="0 0 320 360" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="İLLURÊ FRAGRANCE Crest"
    >
      {showBackground && (
        <rect width="320" height="360" rx="8" fill="#080C0D" />
      )}

      {/* OUTER DOUBLE CIRCLE FRAME WITH APEX ARCH TIPS */}
      <circle cx="160" cy="180" r="148" stroke={color} strokeWidth="2.5" />
      <circle cx="160" cy="180" r="138" stroke={color} strokeWidth="1.2" strokeDasharray="none" />

      {/* APEX ARCH POINTERS (12 and 6 o'clock) */}
      <path d="M 148 33 L 160 20 L 172 33" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 148 327 L 160 340 L 172 327" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* TOP DECORATIVE FLAME & BAROQUE SCROLL FILIGREE */}
      <g opacity="0.95">
        {/* Main Upper Teardrop / Flame Motif */}
        <path 
          d="M 160 62 
             C 167 72 173 85 173 95 
             C 173 104 167 111 160 111 
             C 153 111 147 104 147 95 
             C 147 85 153 72 160 62 Z" 
          fill={color} 
        />
        {/* Horizontal bars around flame stem */}
        <line x1="150" y1="80" x2="170" y2="80" stroke={color} strokeWidth="2" />
        <line x1="153" y1="85" x2="167" y2="85" stroke={color} strokeWidth="1.5" />

        {/* Left Swirl Filigree */}
        <path 
          d="M 147 93 C 135 88 126 98 135 106 C 143 112 150 104 146 98 C 144 95 139 96 141 99" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Right Swirl Filigree */}
        <path 
          d="M 173 93 C 185 88 194 98 185 106 C 177 112 170 104 174 98 C 176 95 181 96 179 99" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* Secondary hanging droplet under flame */}
        <path 
          d="M 160 120 C 164 125 165 130 160 135 C 155 130 156 125 160 120 Z" 
          fill={color} 
        />
      </g>

      {/* CENTER BRAND WORDMARK: İLLURÊ */}
      <text 
        x="160" 
        y="186" 
        textAnchor="middle" 
        fill={color} 
        style={{
          fontFamily: "'Bodoni Moda', 'Cormorant Garamond', Didot, 'Times New Roman', serif",
          fontSize: "38px",
          fontWeight: "400",
          letterSpacing: "0.22em"
        }}
      >
        İLLURÊ
      </text>

      {/* SECONDARY BRAND TITLE: FRAGRANCE */}
      <text 
        x="160" 
        y="222" 
        textAnchor="middle" 
        fill={color} 
        style={{
          fontFamily: "'Manrope', 'Inter', sans-serif",
          fontSize: "14px",
          fontWeight: "500",
          letterSpacing: "0.48em"
        }}
      >
        FRAGRANCE
      </text>

      {/* BOTTOM DECORATIVE FLOURISH & DROP */}
      <g opacity="0.95">
        {/* Ornate Flourish Arc Bar */}
        <path 
          d="M 105 252 C 138 246 182 246 215 252" 
          stroke={color} 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          fill="none" 
        />
        <path 
          d="M 122 258 C 142 263 178 263 198 258" 
          stroke={color} 
          strokeWidth="1.4" 
          strokeLinecap="round" 
          fill="none" 
        />
        {/* Center dot/bead on lower flourish */}
        <circle cx="160" cy="258" r="3" fill={color} />

        {/* Lower Teardrop Accent */}
        <path 
          d="M 160 272 C 164 278 166 284 160 292 C 154 284 156 278 160 272 Z" 
          fill={color} 
        />
      </g>
    </svg>
  );
}
