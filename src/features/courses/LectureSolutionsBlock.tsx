'use client';

import React from 'react';
import { Lock, CheckCircle2, Video, FileText, ExternalLink, Download } from 'lucide-react';
import { LectureMaterials } from '@/lib/data/courses-types';
import { openPdfExternally, downloadPdfFile } from '@/lib/utils/pdf-actions';

interface LectureSolutionsBlockProps {
  lecture: LectureMaterials;
  onPlayVideo: (hlsUrl: string, title: string, lessonId: string) => void;
  onOpenPdf: (title: string, pagesCount: number) => void;
  onNotify?: (message: string) => void;
}

export function LectureSolutionsBlock({
  lecture,
  onPlayVideo,
  onOpenPdf,
  onNotify,
}: LectureSolutionsBlockProps) {
  const quizUnlocked = lecture.quiz.isPassed;
  const homeworkUnlocked = lecture.homework.isSubmitted;

  const handleExternal = (title: string, pages: number) => {
    openPdfExternally(title, pages);
    if (onNotify) onNotify(`تم فتح "${title}" في نافذة خارجية مستقلة 📄`);
  };

  const handleDownload = (title: string, pages: number) => {
    downloadPdfFile(title, pages);
    if (onNotify) onNotify(`جاري تحميل "${title}" إلى جهازك بنجاح ✅`);
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-200 dark:border-teal-500/20 bg-slate-100/50 dark:bg-[#071719]/40 p-3 space-y-2.5">
      <span className="text-[11px] font-bold text-slate-700 dark:text-teal-300 flex items-center gap-1">
        <span>فيديوهات وملفات نماذج الإجابة التفسيرية</span>
      </span>

      {/* Quiz Solutions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          {quizUnlocked ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          )}
          <span>نموذج إجابة الكويز: {quizUnlocked ? 'متاح للمراجعة والتحميل' : 'يفتح فور تسليم الكويز'}</span>
        </span>
        {quizUnlocked ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPlayVideo(lecture.solution.quizVideoUrl, lecture.solution.quizVideoTitle, `${lecture.id}-sol-q`)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition"
            >
              <Video className="h-3 w-3" />
              <span>فيديو الحل</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenPdf(lecture.solution.quizPdfTitle, 6)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition"
            >
              <FileText className="h-3 w-3" />
              <span>عرض كامل</span>
            </button>
            <button
              type="button"
              onClick={() => handleExternal(lecture.solution.quizPdfTitle, 6)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition"
            >
              <ExternalLink className="h-3 w-3" />
              <span>فتح خارجياً</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload(lecture.solution.quizPdfTitle, 6)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition"
            >
              <Download className="h-3 w-3" />
              <span>تحميل</span>
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-bold">🔒 مقفول</span>
        )}
      </div>

      {/* Homework Solutions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-teal-500/10">
        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          {homeworkUnlocked ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          )}
          <span>نموذج إجابة الواجب: {homeworkUnlocked ? 'متاح للمراجعة والتحميل' : 'يفتح فور تسليم الواجب'}</span>
        </span>
        {homeworkUnlocked ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPlayVideo(lecture.solution.homeworkVideoUrl, lecture.solution.homeworkVideoTitle, `${lecture.id}-sol-hw`)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition"
            >
              <Video className="h-3 w-3" />
              <span>فيديو الحل</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenPdf(lecture.solution.homeworkPdfTitle, 8)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition"
            >
              <FileText className="h-3 w-3" />
              <span>عرض كامل</span>
            </button>
            <button
              type="button"
              onClick={() => handleExternal(lecture.solution.homeworkPdfTitle, 8)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition"
            >
              <ExternalLink className="h-3 w-3" />
              <span>فتح خارجياً</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownload(lecture.solution.homeworkPdfTitle, 8)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 text-[11px] font-bold hover:bg-emerald-500 hover:text-white transition"
            >
              <Download className="h-3 w-3" />
              <span>تحميل</span>
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-bold">🔒 مقفول</span>
        )}
      </div>
    </div>
  );
}
