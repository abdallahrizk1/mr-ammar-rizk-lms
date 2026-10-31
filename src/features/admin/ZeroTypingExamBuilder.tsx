'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileCheck2, Trash2, Edit2, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminExam, AdminLesson } from './admin-types';
import { CreateExamModal } from './CreateExamModal';

interface ZeroTypingExamBuilderProps {
  onSelectExam: (exam: AdminExam) => void;
  selectedExamId?: string;
}

export function ZeroTypingExamBuilder({ onSelectExam, selectedExamId }: ZeroTypingExamBuilderProps) {
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<'quiz' | 'homework'>('quiz');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('20');
  const [passPercentage, setPassPercentage] = useState('50');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchExamsAndLessons = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const [examsRes, lessonsRes] = await Promise.all([
        supabase.from('exams').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
        supabase.from('lessons').select('id, title, module_id, sort_order, required_pass_percentage, publish_at').is('deleted_at', null).limit(100),
      ]);

      if (examsRes.data) {
        setExams(examsRes.data);
        if (examsRes.data.length > 0 && !selectedExamId) {
          onSelectExam(examsRes.data[0]);
        }
      }
      if (lessonsRes.data) setLessons(lessonsRes.data);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchExamsAndLessons();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedLessonId) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('exams')
        .insert({
          title: title.trim(),
          exam_type: examType,
          lesson_id: selectedLessonId,
          duration_minutes: Number(durationMinutes) || 20,
          pass_percentage: Number(passPercentage) || 50,
          shuffle_questions: shuffleQuestions,
        })
        .select()
        .single();

      if (!error && data) {
        setExams((prev) => [data, ...prev]);
        onSelectExam(data);
        setTitle('');
        setIsModalOpen(false);
      }
    } catch {}
    setIsSaving(false);
  };

  const handleDeleteExam = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('exams').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch {}
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
            <span>الامتحانات والكويزات والواجبات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            اختر امتحاناً للبدء في رفع الأسئلة بالصور أو أنشئ كويز جديد
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-bio-deep"
        >
          <Plus className="h-4 w-4" />
          <span>إنشاء امتحان / واجب</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs font-bold text-slate-400">جارٍ تحميل الامتحانات...</div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-teal-500/30">
          <FileCheck2 className="mx-auto h-8 w-8 text-slate-400 dark:text-teal-400 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">لا توجد امتحانات مضافة بعد</p>
          <p className="text-xs text-slate-500 mt-1">ابدأ بإنشاء أول كويز أو واجب للمحاضرة عبر الزر أعلاه</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exams.map((ex) => {
            const isSelected = selectedExamId === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => onSelectExam(ex)}
                className={`cursor-pointer rounded-2xl border p-4 transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-bio-teal bg-teal-50/50 shadow-md dark:border-emerald-400 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-teal-500/20 dark:bg-[#091D20]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                      ex.exam_type === 'quiz' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                    }`}>
                      {ex.exam_type === 'quiz' ? 'كويز محاضرة ⏱️' : 'واجب تطبيقي 📝'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{ex.duration_minutes} دقيقة</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {ex.title}
                  </h3>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-teal-500/10 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">نسبة النجاح: {ex.pass_percentage}%</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteExam(ex.id);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateExam}
        examType={examType}
        setExamType={setExamType}
        title={title}
        setTitle={setTitle}
        selectedLessonId={selectedLessonId}
        setSelectedLessonId={setSelectedLessonId}
        lessons={lessons}
        durationMinutes={durationMinutes}
        setDurationMinutes={setDurationMinutes}
        passPercentage={passPercentage}
        setPassPercentage={setPassPercentage}
        shuffleQuestions={shuffleQuestions}
        setShuffleQuestions={setShuffleQuestions}
        isSaving={isSaving}
      />
    </div>
  );
}
