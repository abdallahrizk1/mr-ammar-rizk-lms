'use client';

import React from 'react';
import Link from 'next/link';
import { X, Play, Award, Clock, Users, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import { LectureMaterials } from '@/lib/data/courses-types';

interface QuizPreCardModalProps {
  courseId: string;
  lecture: LectureMaterials;
  onClose: () => void;
}

export function QuizPreCardModal({ courseId, lecture, onClose }: QuizPreCardModalProps) {
  const quiz = lecture.quiz;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" dir="rtl">
      <div className="flex flex-col h-full sm:h-auto sm:max-h-[88vh] w-full sm:max-w-lg rounded-none sm:rounded-3xl bg-white dark:bg-[#091D20] border-0 sm:border border-slate-200 dark:border-teal-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-teal-500/20 bg-bio-teal/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-bio-teal text-white shadow-sm">
              <Award className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-300 truncate">
                بطاقة معلومات الامتحان
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-teal-200/60 block truncate">
                {quiz.title}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#071719] transition shrink-0"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Grid with Generous Spacing */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {/* Description */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-teal-500/15 bg-slate-50 dark:bg-[#071719] p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-bio-teal dark:text-emerald-400 block mb-1">
              وصف الاختبار:
            </span>
            {quiz.description}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl border border-slate-200/80 dark:border-teal-500/15 bg-white dark:bg-[#071719] p-3 flex flex-col justify-between">
              <span className="text-slate-500 dark:text-teal-300/60 flex items-center gap-1.5 text-[11px]">
                <HelpCircle className="h-3.5 w-3.5 text-bio-teal" />
                عدد الأسئلة
              </span>
              <span className="font-black text-sm text-slate-900 dark:text-white mt-1">
                {quiz.questionsCount} سؤال
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-teal-500/15 bg-white dark:bg-[#071719] p-3 flex flex-col justify-between">
              <span className="text-slate-500 dark:text-teal-300/60 flex items-center gap-1.5 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                مدة الامتحان
              </span>
              <span className="font-black text-sm text-slate-900 dark:text-white mt-1">
                {quiz.durationMinutes} دقيقة
              </span>
            </div>
          </div>

          {/* Statistical Card */}
          <div className="rounded-2xl border border-bio-teal/20 bg-bio-teal/5 dark:bg-[#071719] p-3.5 space-y-3 text-xs">
            <span className="text-xs font-bold text-bio-teal dark:text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              إحصائيات درجات الطلاب في هذا الاختبار
            </span>

            <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center">
              <div className="rounded-xl bg-white dark:bg-[#091D20] p-2.5 border border-slate-200/60 dark:border-teal-500/15">
                <span className="text-[10px] text-slate-400 block mb-0.5">أقل نتيجة</span>
                <span className="text-xs sm:text-sm font-black text-rose-500">{quiz.lowestScore}</span>
              </div>
              <div className="rounded-xl bg-white dark:bg-[#091D20] p-2.5 border border-slate-200/60 dark:border-teal-500/15">
                <span className="text-[10px] text-slate-400 block mb-0.5">المتوسط</span>
                <span className="text-xs sm:text-sm font-black text-amber-500">{quiz.avgScore}</span>
              </div>
              <div className="rounded-xl bg-white dark:bg-[#091D20] p-2.5 border border-slate-200/60 dark:border-teal-500/15">
                <span className="text-[10px] text-slate-400 block mb-0.5">أعلى نتيجة</span>
                <span className="text-xs sm:text-sm font-black text-emerald-500">{quiz.highestScore}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 border-t border-bio-teal/15 text-[11px] text-slate-600 dark:text-teal-200/70">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-bio-teal shrink-0" />
                مرات الدخول: {quiz.attemptsCount} طالب
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                مرات الإنهاء: {quiz.completionsCount} طالب
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 dark:bg-[#071719] border-t border-slate-100 dark:border-teal-500/20 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-teal-500/30 px-4 py-2 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-[#0d2628]"
          >
            إغلاق
          </button>

          <Link
            href={`/courses/${courseId}/exam/${quiz.id}`}
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Play className="h-3.5 w-3.5" />
            <span>ابدأ الامتحان الآن</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
