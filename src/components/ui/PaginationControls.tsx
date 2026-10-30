'use client';

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export function PaginationControls({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemLabel = 'سجل',
}: PaginationControlsProps) {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safePage * pageSize);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      dir="rtl"
      className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 dark:border-teal-500/20 bg-slate-50/90 dark:bg-[#071719] px-3 py-2.5 text-xs"
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-teal-300/70">
        <span>
          عرض <strong className="font-black text-slate-800 dark:text-white">{startItem}</strong> إلى{' '}
          <strong className="font-black text-slate-800 dark:text-white">{endItem}</strong> من أصل{' '}
          <strong className="font-black text-bio-teal dark:text-emerald-400">{totalItems}</strong> {itemLabel}
        </span>
        <span className="text-slate-300 dark:text-teal-500/30">•</span>
        <span>({pageSize} في الصفحة)</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-teal-500/25 bg-white dark:bg-[#091D20] px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0d2628] disabled:opacity-40 disabled:pointer-events-none transition active:scale-95"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          <span>السابق</span>
        </button>

        <div className="flex items-center gap-1 px-1">
          {pages.map((p) => {
            const isActive = p === safePage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`h-7 min-w-[28px] rounded-lg px-2 text-xs font-black transition active:scale-95 ${
                  isActive
                    ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-[#091D20] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-teal-500/20 hover:bg-slate-100 dark:hover:bg-[#0d2628]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-teal-500/25 bg-white dark:bg-[#091D20] px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0d2628] disabled:opacity-40 disabled:pointer-events-none transition active:scale-95"
        >
          <span>التالي</span>
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
