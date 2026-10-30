'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from 'lucide-react';
import { openPdfExternally, downloadPdfFile } from '@/lib/utils/pdf-actions';

interface PdfViewerModalProps {
  title: string;
  pagesCount: number;
  onClose: () => void;
  onNotify?: (message: string) => void;
}

export function PdfViewerModal({
  title,
  pagesCount,
  onClose,
  onNotify,
}: PdfViewerModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullWindow, setIsFullWindow] = useState(false);
  const [localBanner, setLocalBanner] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setLocalBanner(msg);
    if (onNotify) onNotify(msg);
    setTimeout(() => setLocalBanner(null), 3500);
  };

  const handleOpenExternal = () => {
    openPdfExternally(title, pagesCount);
    triggerNotice('تم فتح الملف في نافذة خارجية مستقلة بنجاح 📄');
  };

  const handleDownload = () => {
    downloadPdfFile(title, pagesCount);
    triggerNotice('جاري تحميل الملف إلى جهازك مباشرة ✅');
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${
        isFullWindow ? 'p-0' : 'p-2 sm:p-4'
      }`}
      dir="rtl"
    >
      <div
        className={`flex flex-col bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 shadow-2xl overflow-hidden transition-all ${
          isFullWindow
            ? 'h-screen w-screen rounded-none border-0'
            : 'h-[92vh] w-full max-w-4xl rounded-2xl'
        }`}
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-3.5 border-b border-slate-100 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 truncate">
                {title}
              </h3>
              <span className="text-[10px] text-slate-400 block">
                عارض الملفات ونماذج الإجابة • {pagesCount} صفحة
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsFullWindow((v) => !v)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-[#091D20] text-slate-700 dark:text-slate-200 px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 transition active:scale-95"
              title={isFullWindow ? 'تصغير النافذة' : 'عرض بحجم الشاشة الكاملة'}
            >
              {isFullWindow ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isFullWindow ? 'تصغير العرض' : 'عرض كامل'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenExternal}
              className="inline-flex items-center gap-1 rounded-xl border border-bio-teal/30 dark:border-emerald-500/30 bg-bio-teal/5 hover:bg-bio-teal hover:text-white text-bio-teal dark:text-emerald-300 px-2.5 py-1.5 text-xs font-bold transition active:scale-95"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>فتح خارجياً</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-2.5 py-1.5 text-xs font-bold transition active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>تحميل الملف</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-[#0D2628] transition"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* In-Modal Notification Banner (Replaces native window.alert) */}
        {localBanner && (
          <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{localBanner}</span>
          </div>
        )}

        {/* PDF Reader Page View */}
        <div className="flex-1 bg-slate-100 dark:bg-[#040D0E] p-3 sm:p-6 overflow-y-auto flex items-center justify-center">
          <div
            className={`w-full ${
              isFullWindow ? 'max-w-3xl' : 'max-w-xl'
            } min-h-[380px] sm:aspect-[1/1.35] bg-white dark:bg-[#071719] shadow-lg rounded-2xl border border-slate-200 dark:border-teal-500/20 p-5 sm:p-7 flex flex-col justify-between text-right`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-500/20 pb-3 mb-4">
                <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400">
                  منصة الأستاذ عمار رزق - أحياء 2027
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  الصفحة {currentPage} من {pagesCount}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-2">
                {title} — (الصفحة {currentPage})
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                تعتبر مادة الأحياء للثانوية العامة قائمة على الفهم الدقيق والربط والتحليل واستنتاج العلاقات بين التراكيب والوظائف الحيوية في الكائنات الحية.
              </p>
              <div className="rounded-xl bg-bio-teal/5 dark:bg-emerald-950/20 p-3.5 border border-bio-teal/20 text-xs text-slate-700 dark:text-teal-200/90 leading-relaxed">
                📌 ملاحظة هامة: يمكنك فتح هذا الملف في نافذة خارجية مستقلة أو تكبيره بكامل الشاشة أو تحميله مباشرة على جهازك للمذاكرة في أي وقت.
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
