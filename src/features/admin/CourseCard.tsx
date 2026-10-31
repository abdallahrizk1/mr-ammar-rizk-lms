'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { AdminCourse } from './admin-types';

interface CourseCardProps {
  course: AdminCourse;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CourseCard({
  course: c,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: CourseCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border p-4 transition text-right flex flex-col justify-between ${
        isSelected
          ? 'border-bio-teal bg-teal-50/50 shadow-md dark:border-emerald-400 dark:bg-emerald-950/20'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-teal-500/20 dark:bg-[#091D20]'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#071719] text-slate-600 dark:text-teal-300">
            الصف {c.grade_level} {c.education_type === 'general' ? 'عام' : c.education_type === 'azhar' ? 'أزهري' : 'لغات'}
          </span>
          {c.is_bundle && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300">
              كورس شامل (Bundle)
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug line-clamp-2">
          {c.title}
        </h3>
        {c.description && (
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-1 line-clamp-2">
            {c.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-teal-500/10 flex items-center justify-between">
        <span className="text-sm font-black text-bio-teal dark:text-emerald-400">
          {c.price === 0 ? 'مجاني' : `${c.price} ج.م`}
        </span>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-bio-teal dark:hover:text-emerald-300 transition"
            title="تعديل الكورس"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 transition"
            title="حذف الكورس"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
