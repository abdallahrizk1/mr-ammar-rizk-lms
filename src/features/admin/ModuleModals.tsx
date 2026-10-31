'use client';

import React from 'react';
import type { AdminModule } from './admin-types';

interface ModuleModalsProps {
  isNewModuleModalOpen: boolean;
  setIsNewModuleModalOpen: (val: boolean) => void;
  newModuleTitle: string;
  setNewModuleTitle: (val: string) => void;
  handleCreateModule: (e: React.FormEvent) => void;

  isNewLessonModalOpen: boolean;
  setIsNewLessonModalOpen: (val: boolean) => void;
  newLessonTitle: string;
  setNewLessonTitle: (val: string) => void;
  passPercent: string;
  setPassPercent: (val: string) => void;
  handleCreateLesson: (e: React.FormEvent) => void;

  isLinkModuleModalOpen: boolean;
  setIsLinkModuleModalOpen: (val: boolean) => void;
  selectedModuleToLink: string;
  setSelectedModuleToLink: (val: string) => void;
  availableModules: AdminModule[];
  handleLinkExistingModule: () => void;
}

export function ModuleModals({
  isNewModuleModalOpen,
  setIsNewModuleModalOpen,
  newModuleTitle,
  setNewModuleTitle,
  handleCreateModule,
  isNewLessonModalOpen,
  setIsNewLessonModalOpen,
  newLessonTitle,
  setNewLessonTitle,
  passPercent,
  setPassPercent,
  handleCreateLesson,
  isLinkModuleModalOpen,
  setIsLinkModuleModalOpen,
  selectedModuleToLink,
  setSelectedModuleToLink,
  availableModules,
  handleLinkExistingModule,
}: ModuleModalsProps) {
  return (
    <>
      {/* New Module Modal */}
      {isNewModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" dir="rtl">
          <form onSubmit={handleCreateModule} className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0D2628] p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">إضافة باب / أسبوع جديد</h4>
            <input
              type="text"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="مثال: الباب الأول: الدعامة والحركة"
              className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 p-2 text-xs dark:bg-[#071719]"
              required
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsNewModuleModalOpen(false)} className="px-3 py-1.5 rounded-lg border text-xs">إلغاء</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-bio-teal text-white text-xs font-bold">إنشاء</button>
            </div>
          </form>
        </div>
      )}

      {/* New Lesson Modal */}
      {isNewLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" dir="rtl">
          <form onSubmit={handleCreateLesson} className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0D2628] p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">إضافة محاضرة جديدة</h4>
            <input
              type="text"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder="مثال: المحاضرة 1: الدعامة في النبات"
              className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 p-2 text-xs dark:bg-[#071719]"
              required
            />
            <div>
              <label className="text-[11px] font-bold block mb-1">نسبة النجاح لفتح المحاضرة التالية (%)</label>
              <input
                type="number"
                value={passPercent}
                onChange={(e) => setPassPercent(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 p-2 text-xs dark:bg-[#071719] text-left"
                dir="ltr"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsNewLessonModalOpen(false)} className="px-3 py-1.5 rounded-lg border text-xs">إلغاء</button>
              <button type="submit" className="px-4 py-1.5 rounded-lg bg-bio-teal text-white text-xs font-bold">إضافة</button>
            </div>
          </form>
        </div>
      )}

      {/* Link Existing Module Modal */}
      {isLinkModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" dir="rtl">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D2628] p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">ربط باب موجود بالكورس الشامل</h4>
            <select
              value={selectedModuleToLink}
              onChange={(e) => setSelectedModuleToLink(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 p-2 text-xs dark:bg-[#071719]"
            >
              <option value="">اختر الباب المطلوب ربطه...</option>
              {availableModules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsLinkModuleModalOpen(false)} className="px-3 py-1.5 rounded-lg border text-xs">إلغاء</button>
              <button type="button" onClick={handleLinkExistingModule} className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold">ربط الباب</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
