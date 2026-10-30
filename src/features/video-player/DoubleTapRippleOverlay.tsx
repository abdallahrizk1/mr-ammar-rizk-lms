'use client';

import React from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';

export interface DoubleTapRippleOverlayProps {
  ripple: { side: 'left' | 'right'; id: number } | null;
}

export function DoubleTapRippleOverlay({ ripple }: DoubleTapRippleOverlayProps) {
  if (!ripple) return null;

  const isLeft = ripple.side === 'left';

  return (
    <div
      key={ripple.id}
      dir="ltr"
      className={`pointer-events-none absolute inset-y-0 ${
        isLeft ? 'left-6 sm:left-14' : 'right-6 sm:right-14'
      } flex items-center justify-center z-30 transition-all duration-200`}
    >
      <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-black/85 px-4 py-2.5 sm:px-5 sm:py-3 text-white border border-emerald-400/40 shadow-2xl backdrop-blur-md">
        {isLeft ? (
          <>
            <RotateCcw className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 stroke-[2.5]" />
            <span className="text-[10px] sm:text-xs font-black tracking-wide font-sans text-emerald-300">-10 ثوانٍ</span>
          </>
        ) : (
          <>
            <RotateCw className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 stroke-[2.5]" />
            <span className="text-[10px] sm:text-xs font-black tracking-wide font-sans text-emerald-300">+10 ثوانٍ</span>
          </>
        )}
      </div>
    </div>
  );
}
