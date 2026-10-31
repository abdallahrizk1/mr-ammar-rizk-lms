'use client';

import React from 'react';
import type { AdminCourse } from './admin-types';

interface CourseModalProps {
  isOpen: boolean;
  editingCourse: AdminCourse | null;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  gradeLevel: string;
  setGradeLevel: (val: string) => void;
  educationType: string;
  setEducationType: (val: string) => void;
  validityDays: string;
  setValidityDays: (val: string) => void;
  isBundle: boolean;
  setIsBundle: (val: boolean) => void;
  isSaving: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export function CourseModal({
  isOpen,
  editingCourse,
  title,
  setTitle,
  description,
  setDescription,
  price,
  setPrice,
  gradeLevel,
  setGradeLevel,
  educationType,
  setEducationType,
  validityDays,
  setValidityDays,
  isBundle,
  setIsBundle,
  isSaving,
  onClose,
  onSave,
}: CourseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 text-slate-900 shadow-2xl dark:border-teal-500/30 dark:bg-[#0D2628] dark:text-white max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-bold text-bio-teal dark:text-emerald-400 mb-4">
          {editingCourse ? 'تعديل بيانات الكورس' : 'إضافة كورس جديد'}
        </h3>

        <form onSubmit={onSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold mb-1">اسم الكورس *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كورس الباب الأول: الدعامة والحركة"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm dark:bg-[#071719] dark:border-teal-500/30"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">الوصف التفصيلي</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف محتويات الكورس وأهم النقاط..."
              rows={2}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm dark:bg-[#071719] dark:border-teal-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">السعر (ج.م) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm dark:bg-[#071719] dark:border-teal-500/30 text-left"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">مدة الصلاحية (أيام) *</label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm dark:bg-[#071719] dark:border-teal-500/30 text-left"
                dir="ltr"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">الصف الدراسي</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs dark:bg-[#071719] dark:border-teal-500/30"
              >
                <option value="1">الصف الأول الثانوي</option>
                <option value="2">الصف الثاني الثانوي</option>
                <option value="3">الصف الثالث الثانوي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">نوع التعليم</label>
              <select
                value={educationType}
                onChange={(e) => setEducationType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs dark:bg-[#071719] dark:border-teal-500/30"
              >
                <option value="general">عام</option>
                <option value="azhar">أزهري</option>
                <option value="languages">لغات</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200 dark:border-teal-500/20">
            <input
              type="checkbox"
              id="isBundle"
              checked={isBundle}
              onChange={(e) => setIsBundle(e.target.checked)}
              className="h-4 w-4 rounded accent-bio-teal"
            />
            <label htmlFor="isBundle" className="text-xs font-bold cursor-pointer">
              هذا الكورس عبارة عن كورس شامل موحد (Bundle يربط أبواب سابقة)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold dark:border-teal-500/20"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs font-bold hover:bg-bio-deep"
            >
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ الكورس'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
