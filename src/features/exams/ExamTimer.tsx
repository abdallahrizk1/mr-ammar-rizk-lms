'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  onTick?: (remaining: number) => void;
}

export function ExamTimer({ initialSeconds, onTimeUp, onTick }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (onTick) onTick(next);
        if (next <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp, onTick, remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = remaining < 180; // less than 3 mins

  return (
    <div
      dir="ltr"
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs sm:text-sm font-black border transition ${
        isUrgent
          ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300'
          : 'bg-slate-100 border-slate-200 text-slate-800 dark:bg-[#071719] dark:border-teal-500/30 dark:text-emerald-400'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
      ) : (
        <Clock className="h-4 w-4 text-bio-teal dark:text-emerald-400 shrink-0" />
      )}
      <span>{formatted}</span>
    </div>
  );
}
