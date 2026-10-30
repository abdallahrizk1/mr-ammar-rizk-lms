'use client';

import React, { useState } from 'react';
import { Receipt, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { CourseItem } from '@/lib/data/courses-types';

interface InvoiceSummaryStepProps {
  course: CourseItem;
  onProceed: () => void;
}

export function InvoiceSummaryStep({ course, onProceed }: InvoiceSummaryStepProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] space-y-5" dir="rtl">
      <div>
        <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
          <span>الخطوة 1: ملخص الفاتورة وسياسة الاشتراك</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
          راجع تفاصيل الكورس وقيمة الاشتراك وسياسة الاسترجاع قبل المتابعة
        </p>
      </div>

      {/* Invoice Details Card */}
      <div className="rounded-xl border border-slate-200/80 dark:border-teal-500/15 bg-slate-50 dark:bg-[#071719] p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-teal-500/10">
          <div>
            <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400">
              {course.grade}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {course.title}
            </h3>
          </div>
          <span className="text-base font-black text-bio-teal dark:text-emerald-400">
            {course.priceFormatted}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex justify-between">
            <span>سعر المحتوى والواجبات والمذكرات:</span>
            <span>{course.price} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span>رسوم المعالجة والمنصة:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">مجاناً (0 ج.م)</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200/60 dark:border-teal-500/10 font-black text-slate-900 dark:text-white text-sm">
            <span>المجموع الإجمالي المطلوب:</span>
            <span className="text-bio-teal dark:text-emerald-400">{course.priceFormatted}</span>
          </div>
        </div>
      </div>

      {/* Refund Policy Summary */}
      <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 p-4 text-xs text-slate-700 dark:text-teal-200/90 leading-relaxed space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-bio-teal dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          <span>سياسة الاسترجاع والضمان الأكاديمي</span>
        </div>
        <p>
          يحق للطالب استرداد كامل قيمة الاشتراك خلال 48 ساعة من تاريخ التفعيل في حال لم يتم مشاهدة أكثر من محاضرة واحدة، حرصاً من مستر عمار رزق على تقديم أفضل تجربة تعليمية عادلة.
        </p>
      </div>

      {/* Agreement Checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-bio-teal focus:ring-bio-teal dark:border-teal-500/30"
        />
        <span className="font-semibold leading-relaxed">
          أوافق على الشروط والأحكام وسياسة الاسترجاع الأكاديمية لمنصة مستر عمار رزق.
        </span>
      </label>

      {/* Proceed Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          disabled={!agreeTerms}
          onClick={onProceed}
          className="inline-flex items-center gap-2 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm disabled:opacity-40 transition active:scale-95"
        >
          <span>الذهاب للدفع</span>
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
