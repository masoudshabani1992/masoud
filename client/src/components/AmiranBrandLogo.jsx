import React from 'react';

/**
 * Universal Brand Logo Component for Amiran Packaging & Printing
 * Matches the official attached logos (Logo-Amiran2.png & Amiran-Logo-White.png)
 */
export default function AmiranBrandLogo({
  variant = 'horizontal', // 'horizontal' | 'icon' | 'badge' | 'full'
  theme = 'auto',         // 'light' | 'dark' | 'auto'
  className = '',
  size = 'md',            // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showSubtitle = true
}) {
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-20'
  }[size] || 'h-11';

  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <svg viewBox="0 0 120 120" fill="none" className={sizeClasses}>
          <g transform="translate(10, 10)">
            {/* 3D Isometric Cube */}
            <path d="M50 8 L90 28 L50 48 L10 28 Z" fill="#f59e0b" />
            <path d="M50 8 L90 28 L82 32 L42 12 Z" fill="#fbbf24" opacity="0.6" />
            <path d="M50 48 L90 28 L90 75 L50 96 Z" fill="#d97706" />
            <path d="M10 28 L50 48 L50 96 L10 75 Z" fill="#eab308" />
            {/* White Cutout Details */}
            <path d="M50 48 L50 66 L30 56 L30 38 Z" fill="#ffffff" />
            <path d="M50 48 L70 38 L70 56 L50 66 Z" fill="#f8fafc" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`} dir="rtl">
      {/* 3D Isometric Cube Graphic */}
      <div className="shrink-0 relative">
        <svg viewBox="0 0 90 90" fill="none" className={`${sizeClasses} w-auto drop-shadow-xs`}>
          <g transform="translate(5, 5)">
            {/* Main Navy / Dark Blue Cube Base */}
            <path d="M40 38 L40 78 L5 58 L5 18 Z" fill="#0f2b48" />
            <path d="M40 38 L75 18 L75 58 L40 78 Z" fill="#1b3f66" />
            {/* Inner White Cutout */}
            <path d="M40 38 L40 52 L18 40 L18 26 Z" fill="#ffffff" />
            <path d="M40 38 L62 26 L62 40 L40 52 Z" fill="#f1f5f9" />
            {/* Top Amber / Gold Lid */}
            <path d="M40 8 L68 22 L50 31 L22 17 Z" fill="#e59819" />
            <path d="M68 22 L68 46 L50 55 L50 31 Z" fill="#f59e0b" />
            <path d="M50 31 L50 55 L34 46 L34 23 Z" fill="#d97706" />
            {/* Shimmer Highlight Line */}
            <path d="M40 38 L75 18 M40 38 L5 18 M40 38 L40 78" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" opacity="0.3" />
          </g>
        </svg>
      </div>

      {/* Persian Brand Typography */}
      <div className="flex flex-col justify-center leading-tight">
        <div className={`font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-[13px] sm:text-sm`}>
          صنایع چاپ و بسته‌بندی
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`font-black text-base sm:text-lg tracking-wider ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
            امــیــــران
          </span>
          {showSubtitle && (
            <span className="text-[9px] font-bold text-slate-400 font-mono hidden sm:inline">
              Amiran Packaging
            </span>
          )}
        </div>
        {/* Underline line from logo */}
        <div className={`h-0.5 w-full rounded-full ${theme === 'dark' ? 'bg-amber-400/60' : 'bg-slate-900/60'} mt-0.5`} />
      </div>
    </div>
  );
}
