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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4" dir="rtl">
      <div className="flex flex-col max-h-[90vh] w-full max-w-lg rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-teal-500/20 bg-bio-teal/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bio-teal text-white shadow-sm">
              <Award className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-300">
                بطاقة معلومات الامتحان قبل البدء
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-teal-200/60 block">
                {quiz.title}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#071719] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="rounded-xl border border-slate-200/80 dark:border-teal-500/15 bg-slate-50 dark:bg-[#071719] p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-bio-teal dark:text-emerald-400 block mb-0.5">
              وصف الاختبار:
            </span>
            {quiz.description}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-xl border border-slate-200/80 dark:border-teal-500/15 bg-white dark:bg-[#071719] p-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-teal-300/60 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-bio-teal" />
                عدد الأسئلة
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {quiz.questionsCount} سؤال
              </span>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-teal-500/15 bg-white dark:bg-[#071719] p-2.5 flex items-center justify-between">
              <span className="text-slate-500 dark:text-teal-300/60 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                مدة الامتحان
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {quiz.durationMinutes} دقيقة
              </span>
            </div>
          </div>

          {/* Statistical Card: Min, Avg, Max, Attempts, Completions */}
          <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 dark:bg-[#071719] p-3 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              إحصائيات درجات الطلاب في هذا الاختبار
            </span>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="rounded-lg bg-white dark:bg-[#091D20] p-2 border border-slate-200/60 dark:border-teal-500/15">
                <span className="text-[10px] text-slate-400 block">أقل نتيجة</span>
                <span className="text-xs font-black text-rose-500">{quiz.lowestScore}</span>
              </div>
              <div className="rounded-lg bg-white dark:bg-[#091D20] p-2 border border-slate-200/60 dark:border-teal-500/15">
                <span className="text-[10px] text-slate-400 block">المتوسط العام</span>
                <span className="text-xs font-black text-amber-500">{quiz.avgScore}</span>
              </div>
              <div className="rounded-lg bg-white dark:bg-[#091D20] p-2 border border-slate-200/60 dark:border-teal-500/15">
                <span className="text-[10px] text-slate-400 block">أعلى نتيجة</span>
                <span className="text-xs font-black text-emerald-500">{quiz.highestScore}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-bio-teal/15 text-[11px] text-slate-600 dark:text-teal-200/70">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-bio-teal" />
                مرات الدخول: {quiz.attemptsCount} طالب
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                مرات الإنهاء: {quiz.completionsCount} طالب
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#071719] border-t border-slate-100 dark:border-teal-500/20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-teal-500/30 px-3.5 py-1.5 text-xs font-bold transition"
          >
            إغلاق
          </button>

          <Link
            href={`/courses/${courseId}/exam/${quiz.id}`}
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Play className="h-3.5 w-3.5" />
            <span>ابدأ الامتحان الآن</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
