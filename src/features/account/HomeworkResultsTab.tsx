'use client';

import React, { useState } from 'react';
import { BookOpen, Eye } from 'lucide-react';
import { ExamResultSummary } from '@/lib/data/exam-types';
import { AnswerReviewModal } from './AnswerReviewModal';

interface HomeworkResultsTabProps {
  homeworkResults: ExamResultSummary[];
}

export function HomeworkResultsTab({ homeworkResults }: HomeworkResultsTabProps) {
  const [selectedResult, setSelectedResult] = useState<ExamResultSummary | null>(null);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
            <span>نتائج الواجبات الدراسية (Homework)</span>
          </h2>
          <span className="rounded-full bg-slate-100 dark:bg-[#071719] px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-teal-300">
            {homeworkResults.length} واجبات
          </span>
        </div>

        {/* Mobile Responsive Cards (< md) */}
        <div className="md:hidden space-y-2.5">
          {homeworkResults.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] p-3 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {item.examName}
                </span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs font-black shrink-0">
                  {item.percentage}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-teal-300/70 border-t border-slate-200/60 dark:border-teal-500/10 pt-2">
                <span>الدرجة: <strong className="text-bio-teal dark:text-emerald-400 font-bold">{item.score} / {item.totalQuestions}</strong></span>
                <span>الصحيح: <strong className="text-emerald-600 font-bold">{item.correctCount}</strong></span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResult(item)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-2 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>عرض الإجابات</span>
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-teal-500/20 text-slate-400 dark:text-teal-300/60 text-[11px]">
                <th className="py-2 px-2 font-bold">#</th>
                <th className="py-2 px-2.5 font-bold">اسم الواجب</th>
                <th className="py-2 px-2 font-bold">الأسئلة</th>
                <th className="py-2 px-2 font-bold">الدرجة</th>
                <th className="py-2 px-2 font-bold">النسبة</th>
                <th className="py-2 px-2 font-bold">المحلول</th>
                <th className="py-2 px-2 font-bold">الصحيح</th>
                <th className="py-2 px-2 font-bold">البدء</th>
                <th className="py-2 px-2 font-bold">الانتهاء</th>
                <th className="py-2 px-2.5 font-bold text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10">
              {homeworkResults.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#071719] transition">
                  <td className="py-2.5 px-2 font-bold text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-2.5 font-semibold text-slate-900 dark:text-white">
                    {item.examName}
                  </td>
                  <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300">{item.totalQuestions}</td>
                  <td className="py-2.5 px-2 font-bold text-bio-teal dark:text-emerald-400">
                    {item.score} / {item.totalQuestions}
                  </td>
                  <td className="py-2.5 px-2 font-black text-emerald-600 dark:text-emerald-400">
                    {item.percentage}%
                  </td>
                  <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300">{item.solvedCount}</td>
                  <td className="py-2.5 px-2 font-bold text-emerald-600 dark:text-emerald-400">{item.correctCount}</td>
                  <td className="py-2.5 px-2 text-slate-500 dark:text-teal-300/60 text-[11px]">{item.startTime}</td>
                  <td className="py-2.5 px-2 text-slate-500 dark:text-teal-300/60 text-[11px]">{item.endTime}</td>
                  <td className="py-2.5 px-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedResult(item)}
                      className="inline-flex items-center gap-1 rounded-xl bg-bio-teal/10 hover:bg-bio-teal text-bio-teal hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-600 dark:text-emerald-300 dark:hover:text-white px-2.5 py-1 text-xs font-bold transition active:scale-95"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>عرض الإجابات</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Review Modal */}
      {selectedResult && (
        <AnswerReviewModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}
