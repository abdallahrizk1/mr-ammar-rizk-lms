'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVideoGesturesProps {
  controlsVisibleRef: React.MutableRefObject<boolean>;
  resetHideTimer: () => void;
  togglePlay: () => void;
  handleSkip: (deltaSec: number) => void;
}

export function useVideoGestures({
  controlsVisibleRef, resetHideTimer, togglePlay, handleSkip,
}: UseVideoGesturesProps) {
  const [ripple, setRipple] = useState<{ side: 'left' | 'right'; id: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapSideRef = useRef<'left' | 'right' | null>(null);
  const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rippleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerRipple = useCallback((side: 'left' | 'right') => {
    if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    setRipple({ side, id: Date.now() });
    rippleTimerRef.current = setTimeout(() => setRipple(null), 650);
  }, []);

  const handleVideoAreaClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const side: 'left' | 'right' = clickX < rect.width / 2 ? 'left' : 'right';
    const now = Date.now();
    const isDoubleTap = now - lastTapTimeRef.current < 280 && lastTapSideRef.current === side;

    if (isDoubleTap) {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      lastTapTimeRef.current = now;
      lastTapSideRef.current = side;
      handleSkip(side === 'left' ? -10 : 10);
      triggerRipple(side);
    } else {
      lastTapTimeRef.current = now;
      lastTapSideRef.current = side;
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      singleTapTimeoutRef.current = setTimeout(() => {
        lastTapTimeRef.current = 0;
        lastTapSideRef.current = null;
        singleTapTimeoutRef.current = null;
        if (!controlsVisibleRef.current) resetHideTimer();
        else togglePlay();
      }, 280);
    }
  }, [handleSkip, resetHideTimer, togglePlay, triggerRipple, controlsVisibleRef]);

  useEffect(() => {
    return () => {
      if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
    };
  }, []);

  return { ripple, handleVideoAreaClick };
}
