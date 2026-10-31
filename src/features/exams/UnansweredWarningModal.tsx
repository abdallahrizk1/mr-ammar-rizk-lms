'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UnansweredWarningModalProps {
  unansweredCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function UnansweredWarningModal({
  unansweredCount,
  onCancel,
  onConfirm,
}: UnansweredWarningModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 p-5 shadow-2xl space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">تنبيه قبل تسليم الامتحان</h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-teal-200/80 leading-relaxed">
            متبقي لديك <strong className="text-rose-500 font-black">{unansweredCount}</strong> سؤال لم تقم بحله بعد! هل ترغب في إنهاء وتسليم الامتحان الآن؟
          </p>
        </div>
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-300 dark:border-teal-500/30 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#071719] transition"
          >
            العودة للمراجعة
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold shadow-sm transition active:scale-95"
          >
            نعم، تسليم الآن
          </button>
        </div>
      </div>
    </div>
  );
}
