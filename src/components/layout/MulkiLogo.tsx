import React from 'react';
import { Language } from '../../locales/translations';

interface MulkiLogoProps {
  lang?: Language;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const MulkiLogo: React.FC<MulkiLogoProps> = ({
  lang = 'ar',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subSize = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-[11px]' : 'text-[9px]';

  return (
    <div className="flex items-center gap-2.5 select-none text-start">
      {/* 3D Gold & Emerald Shield Emblem */}
      <div
        className={`${iconSize} rounded-2xl bg-gradient-to-br from-[#0F5A47] via-[#0b4839] to-[#073026] p-0.5 shadow-md shadow-emerald-950/20 border border-amber-400/40 flex items-center justify-center shrink-0 relative overflow-hidden group`}
      >
        {/* Golden ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-amber-300/30 opacity-70 pointer-events-none" />
        
        {/* Crisp vector icon of building + golden key */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
        >
          {/* Main Tower Silhouette */}
          <path
            d="M16 3L7 9V27C7 28.1 7.9 29 9 29H23C24.1 29 25 28.1 25 27V9L16 3Z"
            fill="url(#emeraldGrad)"
            stroke="#F59E0B"
            strokeWidth="1.2"
          />
          {/* Architectural Floor Grid */}
          <path
            d="M11 12H21M11 16H21M11 20H21M11 24H21"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          <path
            d="M16 10V25"
            stroke="#FDE68A"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
          {/* Golden Key Accent at Base */}
          <circle cx="16" cy="24" r="2" fill="#F59E0B" stroke="#FFF" strokeWidth="0.6" />
          <path d="M16 26V28" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" />
          
          <defs>
            <linearGradient id="emeraldGrad" x1="16" y1="3" x2="16" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#126853" />
              <stop offset="1" stopColor="#08382d" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Name Typography in Emerald & Gold */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`${textSize} font-black tracking-tight bg-gradient-to-r from-[#0F5A47] via-[#147a61] to-[#0F5A47] bg-clip-text text-transparent`}
            style={{
              fontFamily: "'Cairo', 'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {lang === 'ar' ? 'مُـلـكـي' : 'MULKI'}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-500/30 text-amber-900 font-mono font-black text-[9px] uppercase tracking-wider">
            SaaS
          </span>
        </div>

        {showSubtitle && (
          <span className={`${subSize} font-bold text-slate-500 tracking-wider uppercase mt-0.5`}>
            {lang === 'ar' ? 'منصة إدارة الأملاك الذكية' : 'Smart PropTech Platform'}
          </span>
        )}
      </div>
    </div>
  );
};
