'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, ChevronLeft, CheckSquare, AlertTriangle } from 'lucide-react';
import { ExamTimer } from '@/features/exams/ExamTimer';
import { QuestionCard } from '@/features/exams/QuestionCard';
import { QuestionNavigator } from '@/features/exams/QuestionNavigator';
import { ExamResultModal } from '@/features/exams/ExamResultModal';
import { ExamSubmissionResult } from '@/features/exams/exams-types';
import { SAMPLE_EXAM_QUESTIONS } from '@/lib/data/exam-data';
import {
  addMistakeItem,
  removeMistakeByQuestionId,
  recordExamSubmission,
} from '@/lib/utils/student-storage';

interface PageProps {
  params: { courseId: string; examId: string } | Promise<{ courseId: string; examId: string }>;
  searchParams?: { type?: string } | Promise<{ type?: string }>;
}

export default function InteractiveExamPage({ params, searchParams }: PageProps) {
  const resolvedParams = params && typeof (params as any)?.then === 'function' ? use(params as any) : (params as any) || {};
  const resolvedSearchParams = searchParams && typeof (searchParams as any)?.then === 'function' ? use(searchParams as any) : (searchParams as any) || {};
  const { courseId, examId } = resolvedParams;
  const isHomework = resolvedSearchParams?.type === 'homework';

  const examTitle = isHomework ? 'واجب المحاضرة التطبيقي' : 'كويز المحاضرة التفاعلي';
  const questions = SAMPLE_EXAM_QUESTIONS;
  const storageKey = `lms_exam_draft_${examId}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [submissionResult, setSubmissionResult] = useState<ExamSubmissionResult | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [unansweredWarningCount, setUnansweredWarningCount] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.flagged) setFlagged(parsed.flagged);
      }
    } catch {}
  }, [storageKey]);

  const handleSelectChoice = (choiceIndex: number) => {
    const q = questions[currentIndex];
    if (!q) return;
    const updated = { ...answers, [q.id]: choiceIndex };
    setAnswers(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers: updated, flagged }));
    } catch {}
  };

  const handleToggleFlag = (questionId: string) => {
    const updated = { ...flagged, [questionId]: !flagged[questionId] };
    setFlagged(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, flagged: updated }));
    } catch {}
  };

  const executeFinalSubmit = () => {
    setUnansweredWarningCount(null);
    const solvedCount = Object.keys(answers).length;
    let correct = 0;
    let wrongs = 0;

    questions.forEach((q) => {
      const studentAns = answers[q.id];
      if (studentAns === q.correctChoiceIndex) {
        correct += 1;
        removeMistakeByQuestionId(q.id, isHomework ? 'homework' : 'quiz');
      } else {
        wrongs += 1;
        addMistakeItem({
          id: `mistake-${Date.now()}-${q.id}`,
          category: isHomework ? 'homework' : 'quiz',
          sourceTitle: `${examTitle} - سؤال ${q.questionNumber}`,
          questionId: q.id,
          questionText: q.questionText,
          diagramTitle: q.diagramTitle,
          choices: q.choices,
          studentChoiceIndex: studentAns ?? 0,
          correctChoiceIndex: q.correctChoiceIndex,
          explanation: q.explanation,
        });
      }
    });

    const percent = Math.round((correct / questions.length) * 100);
    const isPassed = percent >= 50;
    const result: ExamSubmissionResult = {
      totalQuestions: questions.length,
      solvedCount,
      correctCount: correct,
      score: correct,
      percentage: percent,
      isPassed,
    };

    recordExamSubmission({
      examId, courseId, isHomework, score: correct, total: questions.length,
      percentage: percent, isPassed, examTitle,
      submittedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    });

    setWrongCount(wrongs);
    setSubmissionResult(result);
    localStorage.removeItem(storageKey);
  };

  const handleRequestSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      setUnansweredWarningCount(unansweredCount);
      return;
    }
    executeFinalSubmit();
  };

  const activeQuestion = questions[currentIndex];

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div className="flex items-center gap-2.5">
          <Link href={`/courses/${courseId}`} prefetch={false} className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071719] dark:hover:bg-[#0d2628] text-slate-700 dark:text-slate-200 transition">
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-300">{examTitle}</h1>
            <span className="text-[11px] text-slate-400">السؤال {currentIndex + 1} من {questions.length} • حفظ لحظي للإجابات</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ExamTimer initialSeconds={20 * 60} onTimeUp={executeFinalSubmit} />
          <button type="button" onClick={handleRequestSubmit} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition active:scale-95">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>إنهاء وتسليم</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        <div className="lg:col-span-8 space-y-3">
          {activeQuestion && (
            <QuestionCard question={activeQuestion} selectedChoiceIndex={answers[activeQuestion.id]} onSelectChoice={handleSelectChoice} />
          )}

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
            <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))} className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-teal-500/30 px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 transition">
              <ChevronRight className="h-4 w-4" /><span>السؤال السابق</span>
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-teal-300 whitespace-nowrap px-1 text-center">{currentIndex + 1} / {questions.length}</span>
            <button type="button" disabled={currentIndex >= questions.length - 1} onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))} className="inline-flex items-center gap-1 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 transition">
              <span>السؤال التالي</span><ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <QuestionNavigator questions={questions} currentIndex={currentIndex} answers={answers} flagged={flagged} onSelectIndex={(idx) => setCurrentIndex(idx)} onToggleFlag={handleToggleFlag} />
        </div>
      </div>

      {unansweredWarningCount !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" dir="rtl">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 p-5 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">تنبيه قبل تسليم الامتحان</h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-teal-200/80 leading-relaxed">
                متبقي لديك <strong className="text-rose-500 font-black">{unansweredWarningCount}</strong> سؤال لم تقم بحله بعد! هل ترغب في إنهاء وتسليم الامتحان الآن؟
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <button type="button" onClick={() => setUnansweredWarningCount(null)} className="flex-1 rounded-xl border border-slate-300 dark:border-teal-500/30 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#071719] transition">
                العودة للمراجعة
              </button>
              <button type="button" onClick={executeFinalSubmit} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 text-xs font-bold shadow-sm transition active:scale-95">
                نعم، تسليم الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {submissionResult && (
        <ExamResultModal
          courseId={courseId}
          examTitle={examTitle}
          result={submissionResult}
          wrongCount={wrongCount}
          onRetake={() => { setAnswers({}); setFlagged({}); setSubmissionResult(null); setCurrentIndex(0); }}
        />
      )}
    </div>
  );
}
