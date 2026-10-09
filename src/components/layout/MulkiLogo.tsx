import React from 'react';
import { Language } from '../../locales/translations';

interface MulkiLogoProps {
  lang?: Language;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export const MulkiAppIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => {
  const uid = React.useId().replace(/:/g, '');
  const mintBgId = `MintBg-${uid}`;
  const emeraldDarkId = `PortEmeraldDark-${uid}`;
  const emeraldMidId = `PortEmeraldMid-${uid}`;
  const goldId = `PortGold-${uid}`;

  return (
    <div
      className={`${className} relative rounded-2xl bg-[#D2EBD4] border border-[#0F5A47]/20 flex items-center justify-center shadow-xs shrink-0 overflow-hidden p-1 select-none`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs"
      >
        <defs>
          <linearGradient id={mintBgId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DCF2DE" />
            <stop offset="100%" stopColor="#C8E6CA" />
          </linearGradient>

          <linearGradient id={emeraldDarkId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#177858" />
            <stop offset="55%" stopColor="#0C563E" />
            <stop offset="100%" stopColor="#063827" />
          </linearGradient>

          <linearGradient id={emeraldMidId} x1="0" y1="0" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#218E6A" />
            <stop offset="100%" stopColor="#0E5E44" />
          </linearGradient>

          <linearGradient id={goldId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F7E099" />
            <stop offset="50%" stopColor="#D5B05A" />
            <stop offset="100%" stopColor="#A67E2B" />
          </linearGradient>
        </defs>

        {/* Soft Mint Background */}
        <rect x="0" y="0" width="100" height="100" rx="18" fill={`url(#${mintBgId})`} />

        {/* 1. LEFT TOWER */}
        <path d="M21 40 L36 27 V76 L21 90 Z" fill={`url(#${emeraldMidId})`} />
        <path d="M29 48 L34 43 V74 L29 78 Z" fill="none" stroke={`url(#${goldId})`} strokeWidth="2.5" />

        {/* 2. CENTER TALL SKYSCRAPER */}
        <path d="M38 20 L55 6 V62 L38 76 Z" fill={`url(#${emeraldDarkId})`} />
        <path
          d="M38 34 L47 26 V64 M47 44 L55 37"
          fill="none"
          stroke={`url(#${goldId})`}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M55 6 L71 20 V56 L55 44 Z"
          fill="none"
          stroke={`url(#${emeraldMidId})`}
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <line x1="55" y1="16" x2="71" y2="29" stroke={`url(#${emeraldMidId})`} strokeWidth="2.8" />
        <line x1="55" y1="26" x2="71" y2="39" stroke={`url(#${emeraldMidId})`} strokeWidth="2.8" />
        <line x1="55" y1="6" x2="55" y2="62" stroke={`url(#${goldId})`} strokeWidth="3.2" strokeLinecap="round" />

        {/* 3. PORTFOLIO WALLET BODY */}
        <path
          d="M27 92 L47 70 L55 78 L71 56 H79 C83 56 86 59 86 63 V85 C86 89 83 92 79 92 H27 Z"
          fill={`url(#${emeraldDarkId})`}
        />
        <path
          d="M65 60 H78 C80.5 60 82 61.5 82 64 V84 C82 86.5 80.5 88 78 88 H61"
          fill="none"
          stroke={`url(#${goldId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Wallet Clasp Strap & Gold Button */}
        <rect
          x="67"
          y="68"
          width="21"
          height="12"
          rx="5"
          fill={`url(#${emeraldMidId})`}
          stroke={`url(#${goldId})`}
          strokeWidth="2.3"
        />
        <circle cx="73.5" cy="74" r="3" fill={`url(#${goldId})`} />
        <line x1="47" y1="70" x2="65" y2="92" stroke={`url(#${goldId})`} strokeWidth="2.2" />

        {/* 4. BOLD ASCENDING GROWTH ARROW */}
        <path
          d="M13 84 L46 54 L54 62 L83 34"
          fill="none"
          stroke="#D2EBD4"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 84 L46 59 L54 67 L82 40"
          fill="none"
          stroke={`url(#${goldId})`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 83 L46 52 L54 60 L84 31"
          fill="none"
          stroke={`url(#${emeraldDarkId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M71 29 L90 24 L86 43 Z" fill={`url(#${emeraldDarkId})`} />

        {/* 5. ARABIC TITLE INSIDE ICON WITH CLEAR FATHA ON MIM (مَحْفَظَتِي) */}
        <text
          x="50"
          y="96.5"
          textAnchor="middle"
          direction="rtl"
          fontFamily="Cairo, system-ui, sans-serif"
          fontWeight="900"
          fontSize="12.5"
          fill="#0C563E"
        >
          مَـحْفَظَتِي
        </text>
      </svg>
    </div>
  );
};

export const MulkiLogo: React.FC<MulkiLogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
}) => {
  const dimensions = {
    sm: { box: 'w-9 h-9', title: 'text-sm', sub: 'text-[8px]' },
    md: { box: 'w-10 h-10 sm:w-11 sm:h-11', title: 'text-base sm:text-lg', sub: 'text-[8.5px] sm:text-[10px]' },
    lg: { box: 'w-14 h-14', title: 'text-xl sm:text-2xl', sub: 'text-[10px] sm:text-xs' },
  }[size];

  const isLight = variant === 'light';

  return (
    <div className="inline-flex items-center gap-2 sm:gap-2.5 select-none" dir="rtl">
      <MulkiAppIcon className={dimensions.box} />

      <div className="flex flex-col justify-center leading-relaxed pt-1">
        <span
          className={`${dimensions.title} font-black tracking-normal ${
            isLight
              ? 'text-[#F5D061] drop-shadow-xs'
              : 'text-[#B3831E]'
          }`}
        >
          مَـحْفَظَتِي العَقَارِيَّة
        </span>

        {showSubtitle && (
          <span
            className={`${dimensions.sub} font-extrabold uppercase tracking-[0.06em] sm:tracking-[0.08em] ${
              isLight ? 'text-emerald-200' : 'text-[#0F5A47]'
            } -mt-0.5`}
          >
            MY REAL ESTATE PORTFOLIO
          </span>
        )}
      </div>
    </div>
  );
};
