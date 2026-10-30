'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { ExamResultSummary } from '@/lib/data/exam-types';

interface AnswerReviewModalProps {
  result: ExamResultSummary;
  onClose: () => void;
}

const CHOICE_LETTERS = ['( أ )', '( ب )', '( ج )', '( د )'];

export function AnswerReviewModal({ result, onClose }: AnswerReviewModalProps) {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter questions based on student answers
  const filteredQuestions = result.questions.filter((q) => {
    const studentChoice = result.studentAnswers[q.id];
    const isCorrect = studentChoice === q.correctChoiceIndex;
    if (filter === 'wrong') return !isCorrect;
    if (filter === 'correct') return isCorrect;
    return true;
  });

  const activeQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];
  const activeStudentChoice = activeQuestion ? result.studentAnswers[activeQuestion.id] : undefined;
  const isCurrentCorrect = activeQuestion && activeStudentChoice === activeQuestion.correctChoiceIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4" dir="rtl">
      <div className="flex flex-col max-h-[90vh] w-full max-w-2xl rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-teal-500/20">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300">
              {result.examName}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="font-bold text-bio-teal dark:text-emerald-400">
                الدرجة: {result.score} من {result.totalQuestions}
              </span>
              <span>•</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                النسبة: {result.percentage}%
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

        {/* 3 Smart Filter Buttons */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-[#071719] px-3.5 py-2.5 border-b border-slate-100 dark:border-teal-500/15">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'كل الأسئلة' },
              { id: 'wrong', label: 'الإجابات الخاطئة فقط ❌' },
              { id: 'correct', label: 'الإجابات الصحيحة فقط ✅' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setFilter(btn.id as 'all' | 'wrong' | 'correct');
                  setCurrentIndex(0);
                }}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                  filter === btn.id
                    ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-200 dark:bg-[#091D20] dark:text-slate-300'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-bold text-slate-500 dark:text-teal-300/70">
            {filteredQuestions.length} سؤال
          </span>
        </div>

        {/* Question Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5">
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">
              لا توجد أسئلة تطابق هذا الفلتر
            </div>
          ) : (
            <>
              {/* Question card header */}
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-bio-teal/10 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-black text-bio-teal dark:text-emerald-400">
                  السؤال رقم {activeQuestion.questionNumber}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isCurrentCorrect
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  {isCurrentCorrect ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      إجابة صحيحة
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      إجابة خاطئة
                    </>
                  )}
                </span>
              </div>

              {/* Diagram / Question Graphic */}
              {activeQuestion.diagramTitle && (
                <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 p-3 text-center dark:border-teal-500/20 dark:bg-[#071719]">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-bio-teal dark:text-emerald-300">
                    <HelpCircle className="h-4 w-4" />
                    <span>{activeQuestion.diagramTitle}</span>
                  </div>
                </div>
              )}

              {/* Question Text */}
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                {activeQuestion.questionText}
              </p>

              {/* 4 Choices comparison */}
              <div className="space-y-2">
                {activeQuestion.choices.map((choiceText, cIdx) => {
                  const isCorrectAnswer = cIdx === activeQuestion.correctChoiceIndex;
                  const isStudentAnswer = cIdx === activeStudentChoice;

                  let style = 'border-slate-200 bg-slate-50 dark:border-teal-500/20 dark:bg-[#071719] text-slate-800 dark:text-slate-200';
                  if (isCorrectAnswer) {
                    style = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold';
                  } else if (isStudentAnswer && !isCorrectAnswer) {
                    style = 'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500/60 dark:bg-rose-950/40 dark:text-rose-200 font-bold';
                  }

                  return (
                    <div
                      key={cIdx}
                      className={`flex items-center justify-between rounded-xl border p-2.5 sm:p-3 text-xs transition ${style}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-black">{CHOICE_LETTERS[cIdx]}</span>
                        <span>{choiceText}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isStudentAnswer && (
                          <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold">
                            اختيارك
                          </span>
                        )}
                        {isCorrectAnswer && (
                          <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                            الإجابة الصحيحة ✅
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-slate-700 dark:text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                  💡 تفسير مستر عمار رزق:
                </span>
                {activeQuestion.explanation}
              </div>
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {filteredQuestions.length > 0 && (
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#071719] border-t border-slate-100 dark:border-teal-500/20">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-teal-500/30 px-3 py-1.5 text-xs font-bold disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
              <span>السؤال السابق</span>
            </button>

            <span className="text-xs font-bold text-slate-500 dark:text-teal-300">
              {currentIndex + 1} من {filteredQuestions.length}
            </span>

            <button
              type="button"
              disabled={currentIndex >= filteredQuestions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))}
              className="inline-flex items-center gap-1 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold disabled:opacity-40 transition"
            >
              <span>السؤال التالي</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
