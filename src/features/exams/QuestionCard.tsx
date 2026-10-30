'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { ExamQuestion } from '@/lib/data/exam-types';

interface QuestionCardProps {
  question: ExamQuestion;
  selectedChoiceIndex?: number;
  onSelectChoice: (choiceIndex: number) => void;
}

const CHOICE_LETTERS = ['( أ )', '( ب )', '( ج )', '( د )'];

export function QuestionCard({
  question,
  selectedChoiceIndex,
  onSelectChoice,
}: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] space-y-4" dir="rtl">
      {/* Question Header & Number */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-teal-500/15">
        <span className="rounded-xl bg-bio-teal/10 dark:bg-emerald-500/10 px-3 py-1 text-xs font-black text-bio-teal dark:text-emerald-400">
          السؤال رقم {question.questionNumber}
        </span>
        <span className="text-[11px] text-slate-400">
          اختر إجابة واحدة صحيحة من بين الخيارات الـ 4
        </span>
      </div>

      {/* Question Illustration / Diagram Card */}
      {question.diagramTitle && (
        <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 p-4 text-center dark:border-teal-500/20 dark:bg-[#071719] space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-bio-teal dark:text-emerald-300">
            <HelpCircle className="h-4 w-4" />
            <span>رسم توضيحي: {question.diagramTitle}</span>
          </div>
          {/* Biology Stylized diagram SVG */}
          <div className="mx-auto max-w-sm h-28 rounded-lg bg-white/70 dark:bg-[#091D20]/70 border border-bio-teal/15 flex items-center justify-center p-2">
            <svg viewBox="0 0 300 100" className="w-full h-full">
              <ellipse cx="150" cy="50" rx="120" ry="38" fill="none" stroke="#0d9488" strokeWidth="2" strokeDasharray="4,4" />
              <ellipse cx="150" cy="50" rx="90" ry="26" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="2" />
              <circle cx="150" cy="50" r="18" fill="#14b8a6" fillOpacity="0.4" />
              <text x="150" y="54" textAnchor="middle" fontSize="10" fill="#042f2e" fontWeight="bold">فجوة عصارية</text>
              <line x1="150" y1="20" x2="150" y2="32" stroke="#0f766e" strokeWidth="1.5" markerEnd="url(#arrow)" />
            </svg>
          </div>
        </div>
      )}

      {/* Question Text */}
      <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
        {question.questionText}
      </h2>

      {/* The 4 Big Prominent Answer Buttons: ( أ ) - ( ب ) - ( ج ) - ( د ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        {question.choices.map((choiceText, idx) => {
          const isSelected = selectedChoiceIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectChoice(idx)}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-xs sm:text-sm text-right transition active:scale-[0.98] ${
                isSelected
                  ? 'border-bio-teal bg-bio-teal/10 dark:border-emerald-500 dark:bg-emerald-500/15 shadow-sm ring-2 ring-bio-teal/30 dark:ring-emerald-500/40 text-slate-900 dark:text-white font-bold'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-teal-500/20 dark:bg-[#071719] dark:hover:bg-[#0d2628] text-slate-700 dark:text-slate-300'
              }`}
            >
              <span
                className={`flex h-8 sm:h-9 px-2.5 shrink-0 items-center justify-center rounded-xl text-xs sm:text-sm font-black whitespace-nowrap select-none transition ${
                  isSelected
                    ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 dark:bg-[#091D20] dark:border-teal-500/30 dark:text-slate-200'
                }`}
              >
                {CHOICE_LETTERS[idx]}
              </span>
              <span className="leading-snug pt-1 text-xs sm:text-sm font-medium">{choiceText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
