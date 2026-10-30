'use client';

import React, { useState } from 'react';
import { X, Send, ImagePlus, AlertCircle, FileCheck } from 'lucide-react';
import { compressImageToWebp } from '@/lib/utils/image-compression';

interface NewQuestionModalProps {
  remainingQuestionsToday: number;
  maxDailyQuestions: number;
  onSubmit: (data: { title: string; text: string; imageBlobUrl?: string }) => void;
  onClose: () => void;
}

export function NewQuestionModal({
  remainingQuestionsToday,
  maxDailyQuestions,
  onSubmit,
  onClose,
}: NewQuestionModalProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMsg('');
      const compressed = await compressImageToWebp(file, { maxSizeBytes: 500 * 1024 });
      setImageFile(compressed);
    } catch {
      setErrorMsg('تعذر ضغط الصورة، يرجى اختيار ملف صورة صالح');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('يرجى كتابة عنوان مختصر للسؤال');
      return;
    }
    if (!text.trim()) {
      setErrorMsg('يرجى كتابة نص السؤال العلمي بوضوح');
      return;
    }

    let imageBlobUrl: string | undefined = undefined;
    if (imageFile) {
      imageBlobUrl = URL.createObjectURL(imageFile);
    }

    onSubmit({
      title: title.trim(),
      text: text.trim(),
      imageBlobUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4" dir="rtl">
      <div className="flex flex-col max-h-[90vh] w-full max-w-lg rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 dark:border-teal-500/20 bg-bio-teal/5">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-300">
              طرح سؤال علمي جديد لمستر عمار رزق
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-teal-200/60 block">
              الحد المسموح: {maxDailyQuestions} أسئلة كل 24 ساعة (متبقي لك {remainingQuestionsToday})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-[#071719] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              عنوان السؤال
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrorMsg('');
              }}
              placeholder="مثال: استفسار بخصوص حركة المحاليق في النبات"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#071719] dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              نص السؤال بالتفصيل
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErrorMsg('');
              }}
              placeholder="اكتب سؤالك ونقاط عدم الفهم بوضوح..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#071719] dark:text-white resize-none"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              إرفاق صورة مسألة أو رسم بياني (اختياري)
            </label>
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-teal-500/30 bg-slate-50 dark:bg-[#071719] p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#0d2628] transition text-xs text-slate-600 dark:text-teal-200/70">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imageFile ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <FileCheck className="h-4 w-4" />
                  <span>تم تجهيز الصورة: {imageFile.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
                  <span>{isCompressing ? 'جارٍ ضغط الصورة لـ WebP...' : 'اختر صورة من جهازك'}</span>
                </div>
              )}
            </label>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-teal-500/15">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-teal-500/30 px-3.5 py-1.5 text-xs font-bold transition"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isCompressing || !title.trim() || !text.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm disabled:opacity-40 transition active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>إرسال السؤال</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
