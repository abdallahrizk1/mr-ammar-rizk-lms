'use client';

import React from 'react';
import { User, School, Lock } from 'lucide-react';

interface RegisterStepIndicatorProps {
  step: 1 | 2 | 3;
}

export function RegisterStepIndicator({ step }: RegisterStepIndicatorProps) {
  const steps = [
    { num: 1, label: 'البيانات الشخصية', icon: User },
    { num: 2, label: 'البيانات الدراسية', icon: School },
    { num: 3, label: 'تأمين الحساب', icon: Lock },
  ];

  return (
    <div className="mb-3.5 flex items-center justify-between gap-1 border-b border-slate-200 dark:border-teal-500/20 pb-2.5">
      {steps.map((item) => (
        <div key={item.num} className={`flex min-w-0 items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold ${step >= item.num ? 'text-bio-teal dark:text-emerald-300 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step === item.num ? 'bg-bio-teal text-white dark:bg-emerald-500 dark:text-slate-950 font-black shadow-sm' : step > item.num ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-[#071719] dark:border dark:border-teal-500/20 text-slate-500'}`}>
            {item.num}
          </span>
          <span className="truncate">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
