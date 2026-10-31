'use client';

import React from 'react';
import type { AdminLesson } from './admin-types';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  examType: 'quiz' | 'homework';
  setExamType: (val: 'quiz' | 'homework') => void;
  title: string;
  setTitle: (val: string) => void;
  selectedLessonId: string;
  setSelectedLessonId: (val: string) => void;
  lessons: AdminLesson[];
  durationMinutes: string;
  setDurationMinutes: (val: string) => void;
  passPercentage: string;
  setPassPercentage: (val: string) => void;
  shuffleQuestions: boolean;
  setShuffleQuestions: (val: boolean) => void;
  isSaving: boolean;
}

export function CreateExamModal({
  isOpen,
  onClose,
  onSubmit,
  examType,
  setExamType,
  title,
  setTitle,
  selectedLessonId,
  setSelectedLessonId,
  lessons,
  durationMinutes,
  setDurationMinutes,
  passPercentage,
  setPassPercentage,
  shuffleQuestions,
  setShuffleQuestions,
  isSaving,
}: CreateExamModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" dir="rtl">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D2628] p-5 space-y-3">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">إنشاء امتحان أو واجب جديد</h4>

        <div>
          <label className="text-[11px] font-bold block mb-1">النوع</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setExamType('quiz')}
              className={`py-2 rounded-xl text-xs font-bold border ${examType === 'quiz' ? 'border-bio-teal bg-teal-50 text-bio-teal dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-slate-200'}`}
            >
              كويز محاضرة
            </button>
            <button
              type="button"
              onClick={() => setExamType('homework')}
              className={`py-2 rounded-xl text-xs font-bold border ${examType === 'homework' ? 'border-bio-teal bg-teal-50 text-bio-teal dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-slate-200'}`}
            >
              واجب تطبيقي
            </button>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold block mb-1">عنوان الامتحان *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: كويز المحاضرة الأولى: الدعامة في النبات"
            className="w-full rounded-xl border p-2 text-xs dark:bg-[#071719]"
            required
          />
        </div>

        <div>
          <label className="text-[11px] font-bold block mb-1">مربوط بأي محاضرة؟ *</label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full rounded-xl border p-2 text-xs dark:bg-[#071719]"
            required
          >
            <option value="">اختر المحاضرة...</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold block mb-1">المدة بالدقائق</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full rounded-xl border p-2 text-xs dark:bg-[#071719] text-left"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold block mb-1">نسبة النجاح (%)</label>
            <input
              type="number"
              value={passPercentage}
              onChange={(e) => setPassPercentage(e.target.value)}
              className="w-full rounded-xl border p-2 text-xs dark:bg-[#071719] text-left"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#071719] border text-xs">
          <input
            type="checkbox"
            id="shuffleCheck"
            checked={shuffleQuestions}
            onChange={(e) => setShuffleQuestions(e.target.checked)}
            className="h-4 w-4 rounded accent-bio-teal"
          />
          <label htmlFor="shuffleCheck" className="cursor-pointer font-bold">
            ترتيب الأسئلة عشوائياً لكل طالب (منع الغش)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border text-xs">إلغاء</button>
          <button type="submit" disabled={isSaving} className="px-4 py-1.5 rounded-lg bg-bio-teal text-white text-xs font-bold">
            {isSaving ? 'جارٍ الحفظ...' : 'إنشاء'}
          </button>
        </div>
      </form>
    </div>
  );
}
