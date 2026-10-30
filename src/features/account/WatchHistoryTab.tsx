'use client';

import React, { useState } from 'react';
import { PlayCircle, Clock, Video, Calendar } from 'lucide-react';
import { WatchHistoryItem } from '@/lib/data/exam-types';
import { PaginationControls } from '@/components/ui/PaginationControls';

interface WatchHistoryTabProps {
  history: WatchHistoryItem[];
}

const PAGE_SIZE = 10;

export function WatchHistoryTab({ history }: WatchHistoryTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedHistory = history.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2">
            <Video className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
            <span>مشاهدات الفيديوهات والمحاضرات</span>
          </h2>
          <span className="rounded-full bg-slate-100 dark:bg-[#071719] px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-teal-300">
            {history.length} محاضرات
          </span>
        </div>

        {/* Mobile Responsive Cards (< md) - Prevents vertical column squishing */}
        <div className="md:hidden space-y-2.5">
          {paginatedHistory.map((item, idx) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-bio-teal/10 dark:bg-emerald-500/10 text-[11px] font-black text-bio-teal dark:text-emerald-400">
                    {startIndex + idx + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                    {item.videoTitle}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-teal-200/70 pr-8">
                {item.courseTitle}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 dark:border-teal-500/10 pt-2 text-[11px]">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{item.watchDuration}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400 dark:text-teal-300/60">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>{item.watchDate}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-teal-500/20 text-slate-400 dark:text-teal-300/60 text-[11px]">
                <th className="py-2 px-2.5 font-bold">#</th>
                <th className="py-2 px-2.5 font-bold">اسم الفيديو / المحاضرة</th>
                <th className="py-2 px-2.5 font-bold">اسم الكورس</th>
                <th className="py-2 px-2.5 font-bold">حالة المشاهدة</th>
                <th className="py-2 px-2.5 font-bold">وقت وتاريخ المشاهدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10">
              {paginatedHistory.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#071719] transition">
                  <td className="py-2.5 px-2.5 font-bold text-slate-400">{startIndex + idx + 1}</td>
                  <td className="py-2.5 px-2.5 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-bio-teal dark:text-emerald-400 shrink-0" />
                      <span>{item.videoTitle}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-600 dark:text-slate-300">
                    {item.courseTitle}
                  </td>
                  <td className="py-2.5 px-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.watchDuration}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-500 dark:text-teal-300/60 text-[11px]">
                    {item.watchDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalItems={history.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="مشاهدة"
        />
      </div>
    </div>
  );
}
