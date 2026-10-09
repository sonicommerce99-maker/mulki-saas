import React from 'react';
import { Language } from '../../locales/translations';

interface MulkiLogoProps {
  lang?: Language;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export const MulkiAppIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => {
  return (
    <div
      className={`${className} relative rounded-2xl bg-[#D2EBD4] border border-[#0F5A47]/20 flex items-center justify-center shadow-xs shrink-0 overflow-hidden select-none`}
    >
      <img
        src="/portfolio-logo.jpg?v=13"
        alt="مَحْفَظَتِي العَقَارِيَّة"
        className="w-full h-full object-cover"
      />
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
    md: { box: 'w-11 h-11 sm:w-12 sm:h-12', title: 'text-base sm:text-lg', sub: 'text-[8.5px] sm:text-[10px]' },
    lg: { box: 'w-14 h-14', title: 'text-xl sm:text-2xl', sub: 'text-[10px] sm:text-xs' },
  }[size];

  const isLight = variant === 'light';

  return (
    <div className="inline-flex items-center gap-2 sm:gap-2.5 select-none" dir="rtl">
      <MulkiAppIcon className={dimensions.box} />

      <div className="flex flex-col justify-center leading-tight">
        <span
          className={`${dimensions.title} font-black tracking-tight bg-gradient-to-l ${
            isLight
              ? 'from-[#F7E099] via-[#E5C158] to-[#D4AF37] text-transparent bg-clip-text drop-shadow-xs'
              : 'from-[#9A701C] via-[#C69B3C] to-[#8C6414] text-transparent bg-clip-text'
          }`}
        >
          مَحْفَظَتِي العَقَارِيَّة
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
