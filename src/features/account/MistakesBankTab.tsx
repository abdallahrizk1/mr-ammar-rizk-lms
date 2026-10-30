'use client';

import React, { useState } from 'react';
import { AlertCircle, Zap, CheckCircle2 } from 'lucide-react';
import { StudentMistakeItem } from '@/lib/data/exam-types';
import { removeMistakeById } from '@/lib/utils/student-storage';
import { MistakeQuizModal } from './MistakeQuizModal';

interface MistakesBankTabProps {
  mistakes: StudentMistakeItem[];
  onMistakesUpdated?: (updated: StudentMistakeItem[]) => void;
}

const CHOICE_LETTERS = ['( أ )', '( ب )', '( ج )', '( د )'];

export function MistakesBankTab({ mistakes, onMistakesUpdated }: MistakesBankTabProps) {
  const [subTab, setSubTab] = useState<'quiz' | 'homework'>('quiz');
  const [activeMistakeToTest, setActiveMistakeToTest] = useState<StudentMistakeItem | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const filtered = mistakes.filter((m) => m.category === subTab);

  const handleMistakeSolved = (mistakeId: string) => {
    const updated = removeMistakeById(mistakeId);
    if (onMistakesUpdated) onMistakesUpdated(updated);
    setActiveMistakeToTest(null);
    setSuccessBanner('أحسنت! تم حذف السؤال بنجاح من بنك غلطاتك 👏');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        {/* Header & Sub-tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-teal-500/15">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <span>بنك أخطاء الطالب الذكي (غلطاتي)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
              كل سؤال أخطأت فيه يُسجل هنا لمراجعته وإعادة حله حتى تثبت المعلومة
            </p>
          </div>

          {/* 2 Distinct Sub-tabs */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSubTab('quiz')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                subTab === 'quiz'
                  ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#071719] dark:text-slate-300'
              }`}
            >
              أخطاء الكويزات ({mistakes.filter((m) => m.category === 'quiz').length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('homework')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                subTab === 'homework'
                  ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#071719] dark:text-slate-300'
              }`}
            >
              أخطاء الواجبات ({mistakes.filter((m) => m.category === 'homework').length})
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Mistakes List */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">
              رائع جداً! لا توجد أخطاء مسجلة في هذا القسم 🎉
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200/80 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] p-3.5 sm:p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400">
                    📍 {item.sourceTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveMistakeToTest(item)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95 self-start sm:self-auto"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>⚡ اختبرني في غلطاتي الآن</span>
                  </button>
                </div>

                {/* Question Diagram / Illustration */}
                {item.diagramTitle && (
                  <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 p-3 text-center dark:border-teal-500/20 dark:bg-[#071719] space-y-1.5">
                    <span className="text-xs font-bold text-bio-teal dark:text-emerald-300 block">
                      📷 صورة السؤال: {item.diagramTitle}
                    </span>
                    <div className="mx-auto max-w-xs h-20 rounded-lg bg-white/80 dark:bg-[#091D20]/80 border border-bio-teal/15 flex items-center justify-center p-1">
                      <svg viewBox="0 0 240 70" className="w-full h-full">
                        <ellipse cx="120" cy="35" rx="90" ry="26" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="3,3" />
                        <ellipse cx="120" cy="35" rx="65" ry="18" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1.5" />
                        <text x="120" y="39" textAnchor="middle" fontSize="9" fill="#042f2e" fontWeight="bold">رسم توضيحي للمسألة</text>
                      </svg>
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  {item.questionText}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30 p-2.5 text-rose-900 dark:text-rose-200">
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mb-0.5">
                      ❌ إجابتك الخاطئة السابقة:
                    </span>
                    <span className="font-bold">{CHOICE_LETTERS[item.studentChoiceIndex]} {item.choices[item.studentChoiceIndex]}</span>
                  </div>

                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 p-2.5 text-emerald-900 dark:text-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      ✅ الإجابة الصحيحة المعتمدة:
                    </span>
                    <span className="font-bold">{CHOICE_LETTERS[item.correctChoiceIndex]} {item.choices[item.correctChoiceIndex]}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-teal-500/10">
                  <span className="font-bold text-bio-teal dark:text-emerald-400">💡 التفسير: </span>
                  {item.explanation}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeMistakeToTest && (
        <MistakeQuizModal
          mistake={activeMistakeToTest}
          onSuccess={handleMistakeSolved}
          onClose={() => setActiveMistakeToTest(null)}
        />
      )}
    </div>
  );
}
