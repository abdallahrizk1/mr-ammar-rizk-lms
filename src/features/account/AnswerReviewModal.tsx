'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, ChevronRight, ChevronLeft, HelpCircle, ExternalLink, Download, Maximize2, Minimize2 } from 'lucide-react';
import { ExamResultSummary } from '@/lib/data/exam-types';
import { openPdfExternally, downloadPdfFile } from '@/lib/utils/pdf-actions';

interface AnswerReviewModalProps {
  result: ExamResultSummary;
  onClose: () => void;
}

const CHOICE_LETTERS = ['(أ)', '(ب)', '(ج)', '(د)'];

export function AnswerReviewModal({ result, onClose }: AnswerReviewModalProps) {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullWindow, setIsFullWindow] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 3500);
  };

  const totalCount = result.questions.length;
  const wrongCount = result.questions.filter((q) => result.studentAnswers[q.id] !== q.correctChoiceIndex).length;
  const correctCount = result.questions.filter((q) => result.studentAnswers[q.id] === q.correctChoiceIndex).length;

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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ${isFullWindow ? 'p-0' : 'p-0 sm:p-4'}`} dir="rtl">
      <div className={`flex flex-col bg-white dark:bg-[#091D20] shadow-2xl overflow-hidden transition-all ${isFullWindow ? 'h-screen w-screen rounded-none border-0' : 'h-full sm:h-auto sm:max-h-[88vh] w-full sm:max-w-3xl rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-teal-500/30'}`}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 sm:p-4 border-b border-slate-100 dark:border-teal-500/20 bg-bio-teal/5">
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-300 truncate">
              نموذج إجابة: {result.examName}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="font-bold text-bio-teal dark:text-emerald-400">الدرجة: {result.score} من {result.totalQuestions}</span>
              <span>•</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">النسبة: {result.percentage}%</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button type="button" onClick={() => setIsFullWindow((v) => !v)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-[#091D20] px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition">
              {isFullWindow ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span>{isFullWindow ? 'تصغير' : 'عرض كامل'}</span>
            </button>
            <button type="button" onClick={() => { openPdfExternally(`نموذج إجابة ${result.examName}`, totalCount); showBanner('تم فتح ملف نموذج الإجابة في نافذة خارجية مستقلة 📄'); }} className="inline-flex items-center gap-1 rounded-xl border border-bio-teal/30 dark:border-emerald-500/30 bg-bio-teal/5 hover:bg-bio-teal hover:text-white text-bio-teal dark:text-emerald-300 px-2.5 py-1.5 text-[11px] font-bold transition">
              <ExternalLink className="h-3.5 w-3.5" /><span>فتح خارجياً</span>
            </button>
            <button type="button" onClick={() => { downloadPdfFile(`نموذج إجابة ${result.examName}`, totalCount); showBanner('جاري تحميل ملف نموذج الإجابة إلى جهازك مباشرة ✅'); }} className="inline-flex items-center gap-1 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 text-white px-2.5 py-1.5 text-[11px] font-bold transition">
              <Download className="h-3.5 w-3.5" /><span>تحميل</span>
            </button>
            <button type="button" onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#071719] transition" aria-label="إغلاق">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {bannerMsg && (
          <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0" /><span>{bannerMsg}</span>
          </div>
        )}

        {/* 3 Smart Filter Buttons (Clean 3-column grid) */}
        <div className="p-2 sm:p-3 bg-slate-50 dark:bg-[#071719] border-b border-slate-100 dark:border-teal-500/15">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { id: 'all' as const, label: 'كل الأسئلة', count: totalCount, activeCls: 'bg-bio-teal text-white dark:bg-emerald-600', badgeCls: 'bg-white/20 text-white', inactBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-teal-300' },
              { id: 'wrong' as const, label: 'الخاطئة', count: wrongCount, activeCls: 'bg-rose-600 text-white', badgeCls: 'bg-white/20 text-white', inactBadge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
              { id: 'correct' as const, label: 'الصحيحة', count: correctCount, activeCls: 'bg-emerald-600 text-white', badgeCls: 'bg-white/20 text-white', inactBadge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => { setFilter(b.id); setCurrentIndex(0); }}
                className={`flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-xs font-bold transition ${filter === b.id ? `${b.activeCls} shadow-sm` : 'bg-white dark:bg-[#091D20] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-teal-500/20'}`}
              >
                <span>{b.label}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${filter === b.id ? b.badgeCls : b.inactBadge}`}>{b.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">لا توجد أسئلة تطابق هذا الفلتر</div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-teal-500/15">
                <span className="rounded-xl bg-bio-teal/10 dark:bg-emerald-500/10 px-3 py-1 text-xs font-black text-bio-teal dark:text-emerald-400">
                  السؤال {activeQuestion.questionNumber}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${isCurrentCorrect ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                  {isCurrentCorrect ? <><CheckCircle2 className="h-3.5 w-3.5" /><span>إجابة صحيحة</span></> : <><XCircle className="h-3.5 w-3.5" /><span>إجابة خاطئة</span></>}
                </span>
              </div>

              {activeQuestion.diagramTitle && (
                <div className="rounded-2xl border border-bio-teal/20 bg-bio-teal/5 p-3 text-center dark:border-teal-500/20 dark:bg-[#071719]">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-bio-teal dark:text-emerald-300">
                    <HelpCircle className="h-4 w-4" /><span>{activeQuestion.diagramTitle}</span>
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">{activeQuestion.questionText}</p>

              <div className="space-y-2.5">
                {activeQuestion.choices.map((choiceText, cIdx) => {
                  const isCorrectAnswer = cIdx === activeQuestion.correctChoiceIndex;
                  const isStudentAnswer = cIdx === activeStudentChoice;
                  let style = 'border-slate-200 bg-slate-50 dark:border-teal-500/20 dark:bg-[#071719] text-slate-800 dark:text-slate-200';
                  if (isCorrectAnswer) style = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold';
                  else if (isStudentAnswer) style = 'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500/60 dark:bg-rose-950/40 dark:text-rose-200 font-bold';

                  return (
                    <div key={cIdx} className={`flex items-start justify-between gap-3 rounded-2xl border p-3 sm:p-3.5 text-xs sm:text-sm transition ${style}`}>
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className="shrink-0 flex h-7 px-2 items-center justify-center rounded-lg bg-slate-200/80 dark:bg-[#091D20] text-xs font-black whitespace-nowrap">{CHOICE_LETTERS[cIdx]}</span>
                        <span className="pt-0.5 leading-relaxed">{choiceText}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        {isStudentAnswer && <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold">اختيارك</span>}
                        {isCorrectAnswer && <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">الإجابة الصحيحة ✅</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-slate-700 dark:text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">💡 تفسير مستر عمار رزق:</span>
                {activeQuestion.explanation}
              </div>
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {filteredQuestions.length > 0 && (
          <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-[#071719] border-t border-slate-100 dark:border-teal-500/20 gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="flex-1 max-w-[130px] inline-flex items-center justify-center gap-1 rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-[#091D20] px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition shadow-sm active:scale-95"
            >
              <ChevronRight className="h-4 w-4" /><span>السابق</span>
            </button>

            <span className="text-xs font-black text-slate-800 dark:text-emerald-300 whitespace-nowrap px-1 text-center">
              سؤال {currentIndex + 1} من {filteredQuestions.length}
            </span>

            <button
              type="button"
              disabled={currentIndex >= filteredQuestions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))}
              className="flex-1 max-w-[130px] inline-flex items-center justify-center gap-1 rounded-xl bg-bio-teal dark:bg-emerald-600 hover:bg-bio-deep text-white px-3 py-2 text-xs font-bold disabled:opacity-30 disabled:pointer-events-none transition shadow-sm active:scale-95"
            >
              <span>التالي</span><ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
