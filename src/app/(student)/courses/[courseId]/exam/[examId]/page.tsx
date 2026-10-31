'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, ChevronLeft, CheckSquare, AlertTriangle, AlertCircle } from 'lucide-react';
import { ExamTimer } from '@/features/exams/ExamTimer';
import { QuestionCard } from '@/features/exams/QuestionCard';
import { QuestionNavigator } from '@/features/exams/QuestionNavigator';
import { ExamResultModal } from '@/features/exams/ExamResultModal';
import { UnansweredWarningModal } from '@/features/exams/UnansweredWarningModal';
import { ExamSubmissionResult } from '@/features/exams/exams-types';
import { ExamQuestion } from '@/lib/data/exam-types';
import { createClient } from '@/lib/supabase/client';
import { recordExamSubmission, removeMistakeByQuestionId } from '@/lib/utils/student-storage';

interface PageProps {
  params: { courseId: string; examId: string } | Promise<{ courseId: string; examId: string }>;
  searchParams?: { type?: string } | Promise<{ type?: string }>;
}

export default function InteractiveExamPage({ params, searchParams }: PageProps) {
  const resolvedParams: any = params && typeof (params as any)?.then === 'function' ? use(params as any) : params || {};
  const resolvedSearchParams: any = searchParams && typeof (searchParams as any)?.then === 'function' ? use(searchParams as any) : searchParams || {};
  const { courseId, examId } = resolvedParams;
  const isHomework = resolvedSearchParams?.type === 'homework';
  const examTitle = isHomework ? 'واجب المحاضرة التطبيقي' : 'كويز المحاضرة التفاعلي';
  const storageKey = `lms_exam_draft_${examId}`;
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(20 * 60);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [submissionResult, setSubmissionResult] = useState<ExamSubmissionResult | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [unansweredWarningCount, setUnansweredWarningCount] = useState<number | null>(null);

  useEffect(() => {
    const initExam = async () => {
      setIsLoading(true);
      if (!examId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(examId)) {
        setErrorMessage('معرّف الامتحان غير صحيح');
        setIsLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('start_or_resume_exam', { p_exam_id: examId });

        if (error || !data) {
          setErrorMessage(error?.message || 'تعذر بدء الامتحان، يرجى التأكد من فتح المحاضرة');
          setIsLoading(false);
          return;
        }

        setAttemptId(data.attempt_id);
        if (data.remaining_seconds) setRemainingSeconds(data.remaining_seconds);

        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const mapped: ExamQuestion[] = data.questions.map((q: any, idx: number) => ({
            id: q.id,
            questionNumber: idx + 1,
            questionText: q.question_text || 'انظر السؤال وحدد الإجابة الصحيحة:',
            diagramTitle: q.image_url ? 'رسم السؤال والاختيارات' : undefined,
            choices: ['( أ )', '( ب )', '( ج )', '( د )'],
            correctChoiceIndex: 0,
          }));
          setQuestions(mapped);
        } else {
          setErrorMessage('لم يتم إضافة أسئلة لهذا الامتحان بعد');
        }
      } catch {
        setErrorMessage('حدث خطأ في الاتصال بالسيرفر');
      }
      setIsLoading(false);
    };

    if (examId) initExam();
  }, [examId]);

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

  const executeFinalSubmit = async () => {
    setUnansweredWarningCount(null);
    const optionLetters = ['a', 'b', 'c', 'd'];
    const mappedAnswers: Record<string, string> = {};
    Object.entries(answers).forEach(([qId, idx]) => { mappedAnswers[qId] = optionLetters[idx] || 'a'; });

    let score = 0, pct = 0, passed = false, correct = 0;
    const solved = Object.keys(answers).length;

    if (attemptId) {
      try {
        const supabase = createClient();
        const { data } = await supabase.rpc('submit_exam_attempt', { p_attempt_id: attemptId, p_answers: mappedAnswers });
        await supabase.rpc('review_submitted_attempt', { p_attempt_id: attemptId });
        score = Number(data?.score) || 0;
        pct = Number(data?.score_percentage) || 0;
        passed = !!data?.passed;
        correct = Number(data?.correct_answers_count) || 0;
      } catch {}
    } else {
      correct = questions.filter((q) => answers[q.id] === q.correctChoiceIndex).length;
      score = correct;
      pct = Math.round((correct / (questions.length || 1)) * 100);
      passed = pct >= 50;
    }

    const result: ExamSubmissionResult = { totalQuestions: questions.length, solvedCount: solved, correctCount: correct, score, percentage: pct, isPassed: passed };
    recordExamSubmission({ examId, courseId, isHomework, score, total: questions.length, percentage: pct, isPassed: passed, examTitle, submittedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) });
    questions.forEach((q) => { if (answers[q.id] === q.correctChoiceIndex) removeMistakeByQuestionId(q.id, isHomework ? 'homework' : 'quiz'); });
    setWrongCount(questions.length - correct);
    setSubmissionResult(result);
    try { localStorage.removeItem(storageKey); } catch {}
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

  if (isLoading) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-bio-teal border-t-transparent mx-auto mb-3" />
        <span className="text-xs font-bold text-slate-500">جارٍ إعداد وتحميل أسئلة الامتحان...</span>
      </div>
    );
  }

  if (errorMessage && questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 rounded-2xl bg-white dark:bg-[#091D20]" dir="rtl">
        <AlertCircle className="h-10 w-10 mx-auto mb-2 text-rose-500" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{errorMessage}</h3>
        <Link href={`/courses/${courseId}`} prefetch={false} className="mt-3 inline-block text-xs font-bold text-bio-teal">العودة للمحاضرات</Link>
      </div>
    );
  }

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
          <ExamTimer initialSeconds={remainingSeconds} onTimeUp={executeFinalSubmit} />
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
        <UnansweredWarningModal unansweredCount={unansweredWarningCount} onCancel={() => setUnansweredWarningCount(null)} onConfirm={executeFinalSubmit} />
      )}

      {submissionResult && (
        <ExamResultModal courseId={courseId} examTitle={examTitle} result={submissionResult} wrongCount={wrongCount} onRetake={() => { setAnswers({}); setFlagged({}); setSubmissionResult(null); setCurrentIndex(0); }} />
      )}
    </div>
  );
}
