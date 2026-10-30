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
        isLeft ? 'left-0 rounded-r-3xl' : 'right-0 rounded-l-3xl'
      } w-2/5 sm:w-1/3 flex items-center justify-center bg-emerald-500/15 backdrop-blur-[2px] transition-all duration-300 z-30`}
    >
      <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-black/80 px-3.5 py-2 sm:px-4 sm:py-2.5 text-white border border-emerald-400/30 shadow-2xl">
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
