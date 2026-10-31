'use client';

import React from 'react';
import { UploadCloud } from 'lucide-react';

interface QuestionUploadBoxProps {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  correctOption: 'A' | 'B' | 'C' | 'D';
  setCorrectOption: (val: 'A' | 'B' | 'C' | 'D') => void;
  points: string;
  setPoints: (val: string) => void;
  isUploading: boolean;
  onAddQuestion: (e: React.FormEvent) => void;
  optionLabels: Record<'A' | 'B' | 'C' | 'D', string>;
}

export function QuestionUploadBox({
  imagePreview,
  onImageChange,
  correctOption,
  setCorrectOption,
  points,
  setPoints,
  isUploading,
  onAddQuestion,
  optionLabels,
}: QuestionUploadBoxProps) {
  return (
    <form onSubmit={onAddQuestion} className="rounded-2xl border border-slate-200 dark:border-teal-500/30 p-4 bg-slate-50 dark:bg-[#071719] space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* File Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
            صورة السؤال شاملة الاختيارات *
          </label>
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-teal-500/30 rounded-xl p-4 text-center hover:bg-slate-100 dark:hover:bg-[#0a2023] transition cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="معاينة السؤال" className="max-h-36 rounded-lg object-contain shadow-sm" />
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-bio-teal dark:text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">انقر لرفع صورة السؤال</span>
                <span className="text-[10px] text-slate-400 mt-0.5">ضغط فوري WebP أقل من 500KB</span>
              </>
            )}
          </div>
        </div>

        {/* Correct Option Buttons & Points */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              الإجابة الصحيحة للسؤال *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setCorrectOption(opt)}
                  className={`py-3 rounded-xl text-sm font-black border transition ${
                    correctOption === opt
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                      : 'border-slate-300 bg-white dark:bg-[#091D20] text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {optionLabels[opt]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-28">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1">الدرجة</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full rounded-xl border p-2 text-xs dark:bg-[#091D20] text-left"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !imagePreview}
              className="mt-4 flex-1 py-2.5 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow hover:bg-bio-deep disabled:opacity-50 transition"
            >
              {isUploading ? 'جارٍ الحفظ والضغط...' : 'حفظ السؤال في الامتحان 🚀'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
