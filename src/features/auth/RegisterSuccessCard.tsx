'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

interface RegisterSuccessCardProps {
  fullName: string;
}

export function RegisterSuccessCard({ fullName }: RegisterSuccessCardProps) {
  return (
    <div dir="rtl" className="mx-auto w-full max-w-md rounded-2xl border border-emerald-500/30 bg-white p-4 sm:p-5 text-center text-slate-900 shadow-xl dark:bg-[#0D2628] dark:border-emerald-500/30 dark:text-white transition-colors">
      <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-7 w-7 animate-bounce" />
      </div>
      <h2 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">تم إنشاء حسابك بنجاح! 🎉</h2>
      <div className="my-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
        ⚡ <strong>تنبيه مراجعة الحساب:</strong> تم فتح حسابك للدخول مبدئياً فوراً. سيتم مراجعة والتأكد من بياناتك وبيانات ولي الأمر خلال 24 إلى 48 ساعة.
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300">أهلاً بك يا <strong>{fullName}</strong> في رحلة التفوق مع مستر عمار رزق!</p>
      <Link prefetch={false} href="/dashboard" className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bio-teal dark:bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95">
        الانتقال إلى لوحة الطالب الرئيسية 🚀
      </Link>
    </div>
  );
}
