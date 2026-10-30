'use client';

import React, { useState } from 'react';
import { X, Zap, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { StudentMistakeItem } from '@/lib/data/exam-types';

interface MistakeQuizModalProps {
  mistakes: StudentMistakeItem[];
  onCompleteExam: (solvedIds: string[]) => void;
  onClose: () => void;
}

const CHOICE_LETTERS = ['( أ )', '( ب )', '( ج )', '( د )'];

export function MistakeQuizModal({ mistakes, onCompleteExam, onClose }: MistakeQuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [solvedIdsResult, setSolvedIdsResult] = useState<string[]>([]);

  const currentQuestion = mistakes[currentIndex];
  if (!currentQuestion) return null;

  const selectedChoice = answers[currentQuestion.id];
  const isCurrentRevealed = !!revealed[currentQuestion.id];
  const isCurrentCorrect = selectedChoice === currentQuestion.correctChoiceIndex;

  const handleSelect = (idx: number) => {
    if (isCurrentRevealed || isFinished) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: idx }));
  };

  const handleCheckCurrent = () => {
    if (selectedChoice === undefined) return;
    setRevealed((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleFinishAll = () => {
    const solved = mistakes.filter((m) => answers[m.id] === m.correctChoiceIndex).map((m) => m.id);
    setSolvedIdsResult(solved);
    setIsFinished(true);
    if (solved.length > 0) onCompleteExam(solved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2.5 sm:p-4" dir="rtl">
      <div className="flex flex-col max-h-[92vh] w-full max-w-xl rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-teal-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-300">
                امتحان تصحيح الأخطاء ({mistakes.length} {mistakes.length === 1 ? 'سؤال' : 'أسئلة'})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-teal-200/60">
                الأسئلة التي تجيبها بشكل صحيح تُحذف تلقائياً من غلطاتك
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#071719] transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isFinished ? (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">نتيجة امتحان تصحيح الغلطات</h4>
              <p className="text-xs text-slate-500 dark:text-teal-200/70 mt-1">
                أجبت بشكل صحيح على <strong className="text-emerald-600 dark:text-emerald-400">{solvedIdsResult.length}</strong> من أصل <strong>{mistakes.length}</strong> أسئلة
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-3">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{solvedIdsResult.length}</div>
                <div className="font-bold text-emerald-800 dark:text-emerald-200">تم تصحيحها وحذفها من غلطاتك ✅</div>
              </div>
              <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3">
                <div className="text-lg font-black text-rose-600 dark:text-rose-400">{mistakes.length - solvedIdsResult.length}</div>
                <div className="font-bold text-rose-800 dark:text-rose-200">تظل في غلطاتك للمراجعة 🔄</div>
              </div>
            </div>

            <button type="button" onClick={onClose} className="w-full rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 text-white py-2.5 text-xs font-black shadow-sm transition active:scale-95">
              العودة إلى قسم غلطاتي
            </button>
          </div>
        ) : (
          <>
            <div className="px-4 pt-3 flex items-center justify-between gap-2 border-b border-slate-100 dark:border-teal-500/10 pb-2.5 bg-slate-50/60 dark:bg-[#071719]/60">
              <span className="text-xs font-black text-bio-teal dark:text-emerald-400 shrink-0">
                السؤال {currentIndex + 1} من {mistakes.length}
              </span>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {mistakes.map((m, idx) => {
                  const ans = answers[m.id];
                  const rev = revealed[m.id];
                  let pillCls = 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                  if (idx === currentIndex) pillCls = 'ring-2 ring-amber-500 bg-amber-500 text-white';
                  else if (rev) pillCls = ans === m.correctChoiceIndex ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white';
                  else if (ans !== undefined) pillCls = 'bg-bio-teal text-white dark:bg-emerald-600';

                  return (
                    <button key={m.id} type="button" onClick={() => setCurrentIndex(idx)} className={`h-6 min-w-[24px] rounded-lg px-1.5 text-[11px] font-black transition ${pillCls}`}>
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
              <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400 block">📍 {currentQuestion.sourceTitle}</span>

              {currentQuestion.diagramTitle && (
                <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 p-2.5 text-center dark:border-teal-500/20 dark:bg-[#071719] text-xs font-bold text-bio-teal dark:text-emerald-300">
                  📷 صورة السؤال: {currentQuestion.diagramTitle}
                </div>
              )}

              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{currentQuestion.questionText}</p>

              <div className="space-y-2 pt-1">
                {currentQuestion.choices.map((choice, idx) => {
                  const isSelected = selectedChoice === idx;
                  let choiceStyle = 'border-slate-200 bg-slate-50 dark:border-teal-500/20 dark:bg-[#071719] text-slate-800 dark:text-slate-200';
                  if (isCurrentRevealed) {
                    if (idx === currentQuestion.correctChoiceIndex) choiceStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold';
                    else if (isSelected) choiceStyle = 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 font-bold';
                  } else if (isSelected) {
                    choiceStyle = 'border-bio-teal bg-bio-teal/10 text-bio-teal dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300 font-bold shadow-sm';
                  }

                  return (
                    <button key={idx} type="button" disabled={isCurrentRevealed} onClick={() => handleSelect(idx)} className={`flex w-full items-center justify-between rounded-xl border p-2.5 sm:p-3 text-xs transition text-right ${choiceStyle}`}>
                      <div className="flex items-center gap-2"><span className="font-black">{CHOICE_LETTERS[idx]}</span><span>{choice}</span></div>
                    </button>
                  );
                })}
              </div>

              {isCurrentRevealed && (
                <div className={`rounded-xl p-3 text-xs space-y-1 ${isCurrentCorrect ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 border border-rose-200 dark:border-rose-800'}`}>
                  <div className="flex items-center gap-1.5 font-black">
                    {isCurrentCorrect ? (
                      <><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" /><span>إجابة صحيحة! سيتم حذف هذا السؤال من غلطاتك عند إنهاء الامتحان 🎉</span></>
                    ) : (
                      <><XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" /><span>إجابة غير صحيحة — سيظل السؤال محفوظاً في غلطاتك لمراجعته.</span></>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 pt-1">💡 التفسير: {currentQuestion.explanation}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-50 dark:bg-[#071719] border-t border-slate-100 dark:border-teal-500/20">
              <div className="flex items-center gap-1.5">
                <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-teal-500/30 px-2.5 py-1.5 text-xs font-bold disabled:opacity-40 transition">
                  <ChevronRight className="h-3.5 w-3.5" /><span>السابق</span>
                </button>
                <button type="button" disabled={currentIndex >= mistakes.length - 1} onClick={() => setCurrentIndex((i) => Math.min(mistakes.length - 1, i + 1))} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-teal-500/30 px-2.5 py-1.5 text-xs font-bold disabled:opacity-40 transition">
                  <span>التالي</span><ChevronLeft className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {!isCurrentRevealed && selectedChoice !== undefined && (
                  <button type="button" onClick={handleCheckCurrent} className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold transition active:scale-95">
                    تحقق من إجابتي
                  </button>
                )}
                <button type="button" onClick={handleFinishAll} className="inline-flex items-center gap-1.5 rounded-xl bg-bio-teal dark:bg-emerald-600 hover:bg-bio-deep text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition active:scale-95">
                  <CheckCircle2 className="h-3.5 w-3.5" /><span>إنهاء وتصحيح الامتحان</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
