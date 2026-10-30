'use client';

import React, { useState } from 'react';
import { X, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { StudentMistakeItem } from '@/lib/data/exam-types';

interface MistakeQuizModalProps {
  mistake: StudentMistakeItem;
  onSuccess: (mistakeId: string) => void;
  onClose: () => void;
}

const CHOICE_LETTERS = ['( أ )', '( ب )', '( ج )', '( د )'];

export function MistakeQuizModal({ mistake, onSuccess, onClose }: MistakeQuizModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const handleTestAnswer = () => {
    if (submitted || selectedChoice === null) return;
    const correct = selectedChoice === mistake.correctChoiceIndex;
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      setTimeout(() => {
        onSuccess(mistake.id);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4" dir="rtl">
      <div className="flex flex-col max-h-[90vh] w-full max-w-lg rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-teal-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300">
                اختبار إعادة حل السؤال الخاطئ
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-teal-200/60">
                إذا قمت بحله بشكل صحيح الآن سيُحذف فوراً من بنك غلطاتك!
              </p>
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

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400 block">
            {mistake.sourceTitle}
          </span>

          {mistake.diagramTitle && (
            <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 p-2.5 text-center dark:border-teal-500/20 dark:bg-[#071719] text-xs font-bold text-bio-teal dark:text-emerald-300">
              📷 {mistake.diagramTitle}
            </div>
          )}

          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
            {mistake.questionText}
          </p>

          <div className="space-y-2 pt-2">
            {mistake.choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              let choiceStyle = 'border-slate-200 bg-slate-50 dark:border-teal-500/20 dark:bg-[#071719] text-slate-800 dark:text-slate-200';
              if (submitted) {
                if (idx === mistake.correctChoiceIndex) {
                  choiceStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold';
                } else if (isSelected && !isCorrect) {
                  choiceStyle = 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold';
                }
              } else if (isSelected) {
                choiceStyle = 'border-bio-teal bg-bio-teal/10 text-bio-teal dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300 font-bold shadow-sm';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={submitted}
                  onClick={() => setSelectedChoice(idx)}
                  className={`flex w-full items-center justify-between rounded-xl border p-2.5 sm:p-3 text-xs transition text-right ${choiceStyle}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black">{CHOICE_LETTERS[idx]}</span>
                    <span>{choice}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {submitted && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${
                isCorrect
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>إجابة صحيحة وممتازة! تم حذف السؤال فوراً من بنك غلطاتك 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 shrink-0" />
                  <span>للأسف الإجابة غير صحيحة، راجع التفسير وحاول مرة ثانية.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#071719] border-t border-slate-100 dark:border-teal-500/20">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-teal-500/30 px-3.5 py-1.5 text-xs font-bold transition"
          >
            إلغاء
          </button>

          {!submitted ? (
            <button
              type="button"
              disabled={selectedChoice === null}
              onClick={handleTestAnswer}
              className="inline-flex items-center gap-1.5 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold shadow-sm disabled:opacity-40 transition active:scale-95"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>تأكيد الإجابة</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 text-white dark:bg-slate-700 px-4 py-1.5 text-xs font-bold transition"
            >
              إغلاق
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
