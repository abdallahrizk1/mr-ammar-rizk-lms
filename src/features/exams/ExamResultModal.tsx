'use client';

import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, XCircle, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { ExamSubmissionResult } from './exams-types';

interface ExamResultModalProps {
  courseId: string;
  examTitle: string;
  result: ExamSubmissionResult;
  wrongCount: number;
  onRetake: () => void;
}

export function ExamResultModal({
  courseId,
  examTitle,
  result,
  wrongCount,
  onRetake,
}: ExamResultModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4" dir="rtl">
      <div className="flex flex-col w-full max-w-md rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 shadow-2xl p-5 text-center space-y-4">
        {/* Celebration / Result Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-bio-teal to-[#0d3435] text-white shadow-lg">
          <Award className="h-8 w-8 text-emerald-300" />
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            نتيجة {examTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            تم تسجيل وحفظ إجاباتك بنجاح في سجل حسابك
          </p>
        </div>

        {/* Score & Percentage */}
        <div className="rounded-2xl bg-slate-50 dark:bg-[#071719] border border-slate-200/80 dark:border-teal-500/20 p-4">
          <div className="text-2xl sm:text-3xl font-black text-bio-teal dark:text-emerald-400">
            {result.score} / {result.totalQuestions}
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-teal-300 mt-1">
            النسبة المئوية: <span className="text-emerald-600 dark:text-emerald-400 font-black">{result.percentage}%</span>
          </div>

          <div className="mt-3 flex items-center justify-around border-t border-slate-200/60 dark:border-teal-500/15 pt-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              صحيح: {result.correctCount}
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-bold">
              <XCircle className="h-3.5 w-3.5" />
              خاطئ: {wrongCount}
            </span>
          </div>
        </div>

        {/* Unlock Status Message */}
        {result.isPassed ? (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 leading-relaxed text-right">
            🎉 مبروك! حققت نسبة أعلى من 50%، تم فتح المحاضرة التالية وفيديوهات ونماذج الحل التفسيرية لك الآن!
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/60 p-3 text-xs font-bold text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 leading-relaxed text-right">
            ⚠️ نتيجتك أقل من 50% المطلوبة لفتح المحاضرة التالية. يمكنك مراجعة الأسئلة وإعادة المحاولة.
          </div>
        )}

        {/* Mistakes Bank Sync Message */}
        {wrongCount > 0 && (
          <div className="flex items-start gap-2 rounded-xl bg-bio-teal/5 dark:bg-emerald-950/20 p-2.5 text-xs text-slate-700 dark:text-teal-200/90 text-right border border-bio-teal/20">
            <AlertCircle className="h-4 w-4 text-bio-teal dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              تمت إضافة {wrongCount} سؤال إلى تاب <strong>&quot;غلطاتي&quot;</strong> في حسابك لتتدرب عليها حتى تتقنها تماماً.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <Link
            href={`/courses/${courseId}`}
            prefetch={false}
            className="flex-1 w-full flex items-center justify-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
          >
            <span>العودة لصفحة الكورس</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={onRetake}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 dark:border-teal-500/30 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#071719] transition active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
