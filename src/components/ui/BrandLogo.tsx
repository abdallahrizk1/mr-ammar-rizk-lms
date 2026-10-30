import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function BrandLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <Link
      href="/"
      prefetch={false}
      className={`group flex items-center gap-3 transition ${className}`}
      dir="rtl"
    >
      {/* Bio DNA Brand Emblem */}
      <div
        className={`relative flex ${iconSizes[size]} shrink-0 items-center justify-center rounded-2xl bg-white p-1 shadow-md shadow-bio-deep/20 ring-1 ring-gold/40 group-hover:ring-gold transition duration-300 dark:bg-[#071719] dark:ring-teal-500/30`}
      >
        <img
          src="/images/logo-ammar.png"
          alt="شعار مستر عمار رزق"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex flex-col text-right">
        <span
          className={`font-black tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}
        >
          الأستاذ <span className="text-bio-teal dark:text-emerald-400">عمار رزق</span>
        </span>
        {showSubtitle && (
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            الأحياء وعلوم الأرض • العلوم المتكاملة
          </span>
        )}
      </div>
    </Link>
  );
}

