'use client';

import React from 'react';
import { Flag } from 'lucide-react';
import { ExamQuestion } from '@/lib/data/exam-types';

interface QuestionNavigatorProps {
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  onSelectIndex: (index: number) => void;
  onToggleFlag: (questionId: string) => void;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  flagged,
  onSelectIndex,
  onToggleFlag,
}: QuestionNavigatorProps) {
  const activeQuestion = questions[currentIndex];
  const isCurrentFlagged = activeQuestion ? !!flagged[activeQuestion.id] : false;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] space-y-3" dir="rtl">
      {/* Header and Toggle Flag Button */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-teal-500/15">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300">
          خريطة الأسئلة
        </h3>

        {activeQuestion && (
          <button
            type="button"
            onClick={() => onToggleFlag(activeQuestion.id)}
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition active:scale-95 border ${
              isCurrentFlagged
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{isCurrentFlagged ? 'معلّم للمراجعة 🚩' : 'علّم للمراجعة 🚩'}</span>
          </button>
        )}
      </div>

      {/* Grid of Question Numbers */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isAnswered = answers[q.id] !== undefined;
          const isFlag = !!flagged[q.id];
          const isCurrent = currentIndex === idx;

          let btnStyle = 'bg-slate-100 text-slate-700 dark:bg-[#071719] dark:text-slate-300';
          if (isFlag) {
            btnStyle = 'bg-amber-400 text-amber-950 font-black shadow-sm';
          } else if (isAnswered) {
            btnStyle = 'bg-emerald-500 text-white font-black shadow-sm';
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative flex h-9 w-full items-center justify-center rounded-xl text-xs font-bold transition active:scale-95 ${btnStyle} ${
                isCurrent ? 'ring-2 ring-bio-teal dark:ring-emerald-400 ring-offset-2 dark:ring-offset-[#091D20]' : ''
              }`}
            >
              <span>{idx + 1}</span>
              {isFlag && (
                <span className="absolute -top-1 -right-1 text-[10px]">🚩</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend / Status Indicators */}
      <div className="pt-2 border-t border-slate-100 dark:border-teal-500/15 grid grid-cols-3 gap-1 text-[10px] text-center text-slate-500 dark:text-teal-200/60">
        <div className="flex items-center justify-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>تم الحل</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>للمراجعة 🚩</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span>متبقي</span>
        </div>
      </div>
    </div>
  );
}
