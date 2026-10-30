'use client';

import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { normalizeActivationCode } from '@/lib/utils/input-normalizer';

interface CenterCodeMethodProps {
  onSuccess: (code: string) => void;
}

export function CenterCodeMethod({ onSuccess }: CenterCodeMethodProps) {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = normalizeActivationCode(code);
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMsg('يرجى إدخال كود سنتر صالح (6 خانات أو أكثر)');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess(cleanCode);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div className="rounded-xl border border-slate-200/80 dark:border-teal-500/15 bg-slate-50 dark:bg-[#071719] p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        أدخل كود الشحن أو كود السنتر المطبوع على كارت الكورس الخاص بك لتفعيل الكورس فوراً دون انتظار.
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          كود السنتر / كارت الشحن
        </label>
        <input
          type="text"
          dir="ltr"
          value={code}
          onChange={(e) => {
            setCode(normalizeActivationCode(e.target.value));
            setErrorMsg('');
          }}
          placeholder="BIO-2027-XXXX"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-base sm:text-sm text-left text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#091D20] dark:text-white"
        />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isVerifying || !code.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm disabled:opacity-40 transition active:scale-95"
      >
        <KeyRound className="h-4 w-4" />
        <span>{isVerifying ? 'جارٍ التحقق والتفعيل...' : 'تفعيل الكورس فوراً'}</span>
      </button>
    </form>
  );
}
