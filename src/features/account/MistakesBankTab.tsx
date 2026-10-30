'use client';

import React, { useState } from 'react';
import { AlertCircle, Zap, CheckCircle2, Eye, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { StudentMistakeItem } from '@/lib/data/exam-types';
import { removeMistakesByIds } from '@/lib/utils/student-storage';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { MistakeQuizModal } from './MistakeQuizModal';

interface MistakesBankTabProps {
  mistakes: StudentMistakeItem[];
  onMistakesUpdated?: (updated: StudentMistakeItem[]) => void;
}

const CHOICE_LETTERS = ['( أ )', '( ب )', '( ج )', '( د )'];
const PAGE_SIZE = 10;

export function MistakesBankTab({ mistakes, onMistakesUpdated }: MistakesBankTabProps) {
  const [subTab, setSubTab] = useState<'quiz' | 'homework'>('quiz');
  const [viewMode, setViewMode] = useState<'summary' | 'browse'>('summary');
  const [desiredCount, setDesiredCount] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [examQuestions, setExamQuestions] = useState<StudentMistakeItem[] | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const quizMistakes = mistakes.filter((m) => m.category === 'quiz');
  const homeworkMistakes = mistakes.filter((m) => m.category === 'homework');
  const filtered = subTab === 'quiz' ? quizMistakes : homeworkMistakes;
  const effectiveCount = Math.max(1, Math.min(desiredCount, filtered.length || 1));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedMistakes = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSubTabChange = (nextTab: 'quiz' | 'homework') => {
    setSubTab(nextTab);
    setViewMode('summary');
    setCurrentPage(1);
    const nextList = nextTab === 'quiz' ? quizMistakes : homeworkMistakes;
    setDesiredCount(Math.min(5, nextList.length || 1));
  };

  const handleMistakesSolved = (solvedIds: string[]) => {
    const updated = removeMistakesByIds(solvedIds);
    if (onMistakesUpdated) onMistakesUpdated(updated);
    setSuccessBanner(`أحسنت! تم تصحيح وحذف ${solvedIds.length} ${solvedIds.length === 1 ? 'سؤال' : 'أسئلة'} بنجاح من بنك غلطاتك 👏`);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-teal-500/15">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <span>بنك أخطاء الطالب الذكي (غلطاتي)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
              امتحن في أخطائك بالعدد الذي تختاره لحذفها، أو تصفح الإجابات الصحيحة والتفسير
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button type="button" onClick={() => handleSubTabChange('quiz')} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${subTab === 'quiz' ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#071719] dark:text-slate-300'}`}>
              أخطاء الكويزات ({quizMistakes.length})
            </button>
            <button type="button" onClick={() => handleSubTabChange('homework')} className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${subTab === 'homework' ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#071719] dark:text-slate-300'}`}>
              أخطاء الواجبات ({homeworkMistakes.length})
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400">
            رائع جداً! لا توجد أخطاء مسجلة في هذا القسم 🎉
          </div>
        ) : viewMode === 'summary' ? (
          <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 dark:border-teal-500/15 pb-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-black text-rose-600 dark:text-rose-400">
                  قسم {subTab === 'quiz' ? 'أخطاء الكويزات والاختبارات' : 'أخطاء الواجبات الدراسية'}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white pt-1">
                  لديك حالياً <span className="text-rose-500">{filtered.length}</span> {filtered.length === 1 ? 'سؤال خاطئ مسجل' : 'أسئلة خاطئة مسجلة'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-teal-200/70">
                  الأسئلة التي تصححها في الامتحان تُحذف من غلطاتك، والأسئلة غير المصححة تظل موجودة لمراجعتها.
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 self-start sm:self-center">
                <span className="text-xl font-black leading-none">{filtered.length}</span>
                <span className="text-[10px] font-bold mt-1">أخطاء</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800 dark:text-emerald-300">
                <SlidersHorizontal className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
                <span>تحب تمتحن على كم سؤال من أخطائك الآن؟</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {Array.from(new Set([1, 2, 3, 5, 10, filtered.length]))
                  .filter((n) => n >= 1 && n <= filtered.length)
                  .sort((a, b) => a - b)
                  .map((num) => {
                    const isAll = num === filtered.length;
                    const isSelected = effectiveCount === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setDesiredCount(num)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-black transition active:scale-95 ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-white dark:bg-[#091D20] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-teal-500/25 hover:bg-slate-100'
                        }`}
                      >
                        {isAll ? `امتحان عليها كلها (${num} أسئلة)` : `${num} ${num === 1 ? 'سؤال' : 'أسئلة'}`}
                      </button>
                    );
                  })}

                <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-teal-500/25 bg-white dark:bg-[#091D20] px-2.5 py-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-teal-300/70">عدد مخصص:</span>
                  <button type="button" onClick={() => setDesiredCount(Math.max(1, effectiveCount - 1))} className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-[#071719] text-xs font-black text-slate-700 dark:text-white">-</button>
                  <input
                    type="number"
                    min={1}
                    max={filtered.length}
                    value={effectiveCount}
                    onChange={(e) => setDesiredCount(Math.max(1, Math.min(filtered.length, Number(e.target.value) || 1)))}
                    aria-label="تحديد عدد الأسئلة"
                    className="w-12 text-center text-base sm:text-xs font-black bg-transparent text-amber-600 dark:text-amber-400 focus:outline-none"
                  />
                  <button type="button" onClick={() => setDesiredCount(Math.min(filtered.length, effectiveCount + 1))} className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-[#071719] text-xs font-black text-slate-700 dark:text-white">+</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => setExamQuestions(filtered.slice(0, effectiveCount))} className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 text-xs sm:text-sm font-black shadow-md transition active:scale-95">
                <Zap className="h-4 w-4 shrink-0" />
                <span>ابدأ امتحان تصحيح ({effectiveCount}) {effectiveCount === 1 ? 'سؤال' : 'أسئلة'} الآن</span>
              </button>
              <button type="button" onClick={() => setViewMode('browse')} className="flex items-center justify-center gap-2 rounded-xl border border-bio-teal/30 dark:border-emerald-500/30 bg-white dark:bg-[#091D20] hover:bg-bio-teal/5 text-bio-teal dark:text-emerald-300 px-4 py-3 text-xs sm:text-sm font-black transition active:scale-95">
                <Eye className="h-4 w-4 shrink-0" />
                <span>مشاهدة الأسئلة والإجابات الصحيحة ({filtered.length})</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100/80 dark:bg-[#071719] p-2.5 border border-slate-200/70 dark:border-teal-500/20">
              <button type="button" onClick={() => setViewMode('summary')} className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/25 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition">
                <ArrowRight className="h-3.5 w-3.5" /><span>العودة لشاشة تحديد عدد أسئلة الامتحان</span>
              </button>
              <button type="button" onClick={() => setExamQuestions(filtered.slice(0, effectiveCount))} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition">
                <Zap className="h-3.5 w-3.5" /><span>امتحن في ({effectiveCount}) أسئلة الآن</span>
              </button>
            </div>

            {paginatedMistakes.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200/80 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400">📍 {item.sourceTitle}</span>
                  <button type="button" onClick={() => setExamQuestions([item])} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95 self-start sm:self-auto">
                    <Zap className="h-3.5 w-3.5" /><span>⚡ اختبرني في هذا السؤال</span>
                  </button>
                </div>

                {item.diagramTitle && (
                  <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 p-2.5 text-center dark:border-teal-500/20 dark:bg-[#091D20]">
                    <span className="text-xs font-bold text-bio-teal dark:text-emerald-300 block">📷 صورة السؤال: {item.diagramTitle}</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{item.questionText}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30 p-2.5 text-rose-900 dark:text-rose-200">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mb-0.5">❌ إجابتك الخاطئة السابقة:</span>
                    <span className="font-bold">{CHOICE_LETTERS[item.studentChoiceIndex]} {item.choices[item.studentChoiceIndex]}</span>
                  </div>
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 p-2.5 text-emerald-900 dark:text-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">✅ الإجابة الصحيحة المعتمدة:</span>
                    <span className="font-bold">{CHOICE_LETTERS[item.correctChoiceIndex]} {item.choices[item.correctChoiceIndex]}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-teal-500/10">
                  <span className="font-bold text-bio-teal dark:text-emerald-400">💡 التفسير: </span>{item.explanation}
                </div>
              </div>
            ))}

            <PaginationControls currentPage={currentPage} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} itemLabel="خطأ" />
          </div>
        )}
      </div>

      {examQuestions && (
        <MistakeQuizModal mistakes={examQuestions} onCompleteExam={handleMistakesSolved} onClose={() => setExamQuestions(null)} />
      )}
    </div>
  );
}
