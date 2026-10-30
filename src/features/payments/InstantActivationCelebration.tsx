'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, PlayCircle, ShieldCheck, Clock } from 'lucide-react';
import { CourseItem } from '@/lib/data/courses-types';

interface InstantActivationCelebrationProps {
  course: CourseItem;
  isCenterCode?: boolean;
}

export function InstantActivationCelebration({
  course,
  isCenterCode = false,
}: InstantActivationCelebrationProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] text-center space-y-5" dir="rtl">
      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-bio-teal text-white shadow-xl">
        <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
      </div>

      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          {isCenterCode ? 'تفعيل نهائي فوري بالكود ✅' : 'تفعيل مؤقت فوري مفتوح للدراسة الآن 🚀'}
        </span>

        <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-2">
          تم تفعيل كورس &quot;{course.title}&quot; بنجاح!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-teal-200/70 mt-1 max-w-md mx-auto leading-relaxed">
          {isCenterCode
            ? 'تم شحن وتفعيل كود السنتر بنجاح. أصبحت جميع محاضرات ومذكرات وامتحانات الكورس متاحة لك بالكامل.'
            : 'تم استلام بيانات التحويل وإيصال الدفع. الكورس مفتوح لك الآن بالكامل ("تفعيل مؤقت لحين مراجعة الأدمن") لتبدأ المذاكرة فوراً دون أي تعطيل!'}
        </p>
      </div>

      {!isCenterCode && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          <span>تتم مراجعة إيصال التحويل بواسطة إدارة المنصة خلال 24 ساعة دون التأثير على استمرارية دراستك.</span>
        </div>
      )}

      {/* Button to enter course */}
      <div className="pt-2">
        <Link
          href={`/courses/${course.id}`}
          prefetch={false}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition active:scale-95"
        >
          <PlayCircle className="h-4 w-4" />
          <span>ابدأ المذاكرة ومشاهدة المحاضرات الآن</span>
        </Link>
      </div>
    </div>
  );
}
