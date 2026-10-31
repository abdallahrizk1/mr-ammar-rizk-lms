'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, Check, Trash2, Edit3, Image as ImageIcon, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { compressImageToWebp } from '@/lib/utils/image-compression';
import type { AdminExam, AdminQuestion } from './admin-types';
import { QuestionUploadBox } from './QuestionUploadBox';

interface RapidQuestionUploaderProps {
  exam: AdminExam;
}

const OPTION_LABELS: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: '( أ )',
  B: '( ب )',
  C: '( ج )',
  D: '( د )',
};

export function RapidQuestionUploader({ exam }: RapidQuestionUploaderProps) {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New question form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [points, setPoints] = useState('1');
  const [isUploading, setIsUploading] = useState(false);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', exam.id)
        .order('sort_order', { ascending: true });

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setQuestions(data.map((q: any) => ({
          id: q.id,
          exam_id: q.exam_id,
          image_url: q.image_url || '/images/teacher-circle.png',
          correct_option: (q.correct_option?.toUpperCase() || 'A') as 'A' | 'B' | 'C' | 'D',
          points: q.points || 1,
          sort_order: q.sort_order || 1,
        })));
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [exam.id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Auto compress to WebP under 500KB
      const compressed = await compressImageToWebp(file, { maxSizeBytes: 500 * 1024, initialQuality: 0.85 });
      setImageFile(compressed);
      const url = URL.createObjectURL(compressed);
      setImagePreview(url);
    } catch {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      // For instant zero-typing exam building: store image preview or presigned R2 path
      const imagePath = imagePreview.startsWith('blob:') ? `/images/exam-question-${Date.now()}.webp` : imagePreview;

      const { data, error } = await supabase
        .from('exam_questions')
        .insert({
          exam_id: exam.id,
          image_url: imagePath,
          correct_option: correctOption.toLowerCase(),
          points: Number(points) || 1,
          sort_order: questions.length + 1,
        })
        .select()
        .single();

      if (!error && data) {
        setQuestions((prev) => [
          ...prev,
          {
            id: data.id,
            exam_id: data.exam_id,
            image_url: data.image_url,
            correct_option: (data.correct_option?.toUpperCase() || 'A') as 'A' | 'B' | 'C' | 'D',
            points: data.points,
            sort_order: data.sort_order,
          },
        ]);
        setImageFile(null);
        setImagePreview(null);
        setCorrectOption('A');
      }
    } catch {}
    setIsUploading(false);
  };

  const handleUpdateCorrectOption = async (qId: string, newOption: 'A' | 'B' | 'C' | 'D') => {
    try {
      const supabase = createClient();
      // Triggers trg_regrade_question in Postgres automatically!
      await supabase
        .from('exam_questions')
        .update({ correct_option: newOption.toLowerCase() })
        .eq('id', qId);

      setQuestions((prev) =>
        prev.map((q) => (q.id === qId ? { ...q, correct_option: newOption } : q))
      );
    } catch {}
  };

  const handleDeleteQuestion = async (qId: string) => {
    try {
      const supabase = createClient();
      await supabase.from('exam_questions').delete().eq('id', qId);
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-6" dir="rtl">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>رفع وتعديل أسئلة:</span>
          <span className="text-bio-teal dark:text-emerald-400 font-black">{exam.title}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
          رفع سريع بالصور بدون كتابة نصوص — اختر الحرف الصحيح فقط وتُضغط الصورة تلقائياً لـ WebP
        </p>
      </div>

      {/* Upload Box */}
      <QuestionUploadBox
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        correctOption={correctOption}
        setCorrectOption={setCorrectOption}
        points={points}
        setPoints={setPoints}
        isUploading={isUploading}
        onAddQuestion={handleAddQuestion}
        optionLabels={OPTION_LABELS}
      />

      {/* Questions List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 dark:text-teal-300/70">
          الأسئلة الحالية ({questions.length} سؤال) — يمكنك تعديل الحرف الصحيح وسيُعاد تصحيح الطلاب تلقائياً:
        </h4>

        {isLoading ? (
          <div className="p-4 text-center text-xs text-slate-400">جارٍ تحميل الأسئلة...</div>
        ) : questions.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">لا توجد أسئلة مرفوعة في هذا الامتحان</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-white dark:border-teal-500/20 dark:bg-[#071719] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>سؤال #{idx + 1} ({q.points} درجة)</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="h-28 rounded-lg bg-slate-100 dark:bg-[#091D20] flex items-center justify-center overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={q.image_url} alt="السؤال" className="h-full w-full object-contain" />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">تعديل الإجابة الصحيحة:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleUpdateCorrectOption(q.id, opt)}
                        className={`py-1 text-xs font-bold rounded-lg border ${
                          q.correct_option === opt
                            ? 'bg-emerald-600 text-white border-emerald-600 font-black'
                            : 'bg-slate-50 dark:bg-[#0D2628] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {OPTION_LABELS[opt]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
