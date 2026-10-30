'use client';

import React, { useState } from 'react';
import { X, Download, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

interface PdfViewerModalProps {
  title: string;
  pagesCount: number;
  onClose: () => void;
}

export function PdfViewerModal({ title, pagesCount, onClose }: PdfViewerModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4" dir="rtl">
      <div className="flex flex-col h-[90vh] w-full max-w-3xl rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300">
                {title}
              </h3>
              <span className="text-[10px] text-slate-400">
                قارئ المذكرات التفاعلي • {pagesCount} صفحة
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('تم بدء تنزيل ملف المذكرة بنجاح')}
              className="inline-flex items-center gap-1 rounded-xl bg-bio-teal/10 hover:bg-bio-teal text-bio-teal hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-600 dark:text-emerald-300 dark:hover:text-white px-3 py-1.5 text-xs font-bold transition active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>تحميل PDF مباشرة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-[#0D2628] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Reader Simulated Page View */}
        <div className="flex-1 bg-slate-100 dark:bg-[#040D0E] p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-xl aspect-[1/1.4] bg-white dark:bg-[#071719] shadow-lg rounded-2xl border border-slate-200 dark:border-teal-500/20 p-6 flex flex-col justify-between text-right">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-500/20 pb-3 mb-4">
                <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400">
                  منصة الأستاذ عمار رزق - أحياء 2027
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  الصفحة {currentPage} من {pagesCount}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">
                {title} (الجزء {currentPage})
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                تعتبر مادة الأحياء للثانوية العامة قائمة على الفهم الدقيق والربط والتحليل واستنتاج العلاقات بين التراكيب والوظائف الحيوية في الكائنات الحية.
              </p>
              <div className="rounded-xl bg-bio-teal/5 dark:bg-emerald-950/20 p-3 border border-bio-teal/20 text-xs text-slate-700 dark:text-teal-200/90 leading-relaxed">
                📌 ملاحظة هامة: احرص على تدوين ملاحظات المحاضرة المرفقة مع هذا الشرح والرجوع لرسومات بنك المعرفة وأطلس الرسومات التشريحية.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-teal-500/20 flex items-center justify-between text-[11px] text-slate-400">
              <span>حقوق الطبع والنشر محفوظة © 2027</span>
              <span>صفحة {currentPage}</span>
            </div>
          </div>
        </div>

        {/* Footer Page Navigation */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-[#091D20] border-t border-slate-100 dark:border-teal-500/20">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-teal-500/30 px-3 py-1.5 text-xs font-bold disabled:opacity-40 transition"
          >
            <ChevronRight className="h-4 w-4" />
            <span>الصفحة السابقة</span>
          </button>

          <span className="text-xs font-bold text-slate-600 dark:text-teal-300">
            صفحة {currentPage} من {pagesCount}
          </span>

          <button
            type="button"
            disabled={currentPage >= pagesCount}
            onClick={() => setCurrentPage((p) => Math.min(pagesCount, p + 1))}
            className="inline-flex items-center gap-1 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold disabled:opacity-40 transition"
          >
            <span>الصفحة التالية</span>
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
