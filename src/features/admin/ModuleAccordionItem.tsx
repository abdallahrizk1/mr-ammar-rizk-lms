'use client';

import React from 'react';
import { Plus, Video, ChevronDown, ChevronUp } from 'lucide-react';
import type { AdminModule, AdminLesson } from './admin-types';

interface ModuleAccordionItemProps {
  module: AdminModule;
  index: number;
  lessons: AdminLesson[];
  isExpanded: boolean;
  selectedLessonId?: string;
  onToggleExpand: () => void;
  onAddLesson: () => void;
  onSelectLesson: (lesson: AdminLesson) => void;
}

export function ModuleAccordionItem({
  module: m,
  index,
  lessons,
  isExpanded,
  selectedLessonId,
  onToggleExpand,
  onAddLesson,
  onSelectLesson,
}: ModuleAccordionItemProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-teal-500/20 dark:bg-[#091D20] overflow-hidden">
      <div
        className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#071719] cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-bio-teal/15 dark:bg-emerald-500/20 text-bio-teal dark:text-emerald-400 text-xs font-black">
            {index + 1}
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {m.title}
          </span>
          <span className="text-[11px] text-slate-400">({lessons.length} محاضرة)</span>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onAddLesson}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bio-teal/10 hover:bg-bio-teal/20 text-bio-teal dark:text-emerald-400 text-[11px] font-bold"
          >
            <Plus className="h-3 w-3" />
            <span>إضافة محاضرة</span>
          </button>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 divide-y divide-slate-100 dark:divide-teal-500/10">
          {lessons.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-2 text-center">لا توجد محاضرات في هذا الباب</p>
          ) : (
            lessons.map((l) => (
              <div
                key={l.id}
                onClick={() => onSelectLesson(l)}
                className={`flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer transition ${
                  selectedLessonId === l.id
                    ? 'bg-teal-50 dark:bg-emerald-950/30 text-bio-teal dark:text-emerald-400 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-[#071719]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs">{l.title}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  نسبة النجاح: {l.required_pass_percentage}%
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
