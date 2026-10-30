'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, PlayCircle, FileText, Award, BookOpen, Download, Eye, ExternalLink, ChevronDown } from 'lucide-react';
import { LectureMaterials } from '@/lib/data/courses-types';
import { openPdfExternally, downloadPdfFile } from '@/lib/utils/pdf-actions';
import { LectureSolutionsBlock } from './LectureSolutionsBlock';

interface LectureItemProps {
  courseId: string;
  lecture: LectureMaterials;
  onPlayVideo: (hlsUrl: string, title: string, lessonId: string) => void;
  onOpenPdf: (title: string, pagesCount: number) => void;
  onOpenQuizModal: (lecture: LectureMaterials) => void;
  onNotify?: (message: string) => void;
}

export function LectureItem({ courseId, lecture, onPlayVideo, onOpenPdf, onOpenQuizModal, onNotify }: LectureItemProps) {
  const [isOpen, setIsOpen] = useState(lecture.isUnlocked && lecture.order === 1);

  const handleOpenExternalPdf = () => {
    openPdfExternally(lecture.pdf.title, lecture.pdf.pagesCount);
    if (onNotify) onNotify(`تم فتح "${lecture.pdf.title}" في نافذة خارجية مستقلة 📄`);
  };

  const handleDownloadPdf = () => {
    downloadPdfFile(lecture.pdf.title, lecture.pdf.pagesCount);
    if (onNotify) onNotify(`تم بدء تحميل "${lecture.pdf.title}" إلى جهازك بنجاح ✅`);
  };

  return (
    <div
      className={`rounded-2xl border transition ${
        lecture.isUnlocked
          ? 'border-slate-200 bg-white shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]'
          : 'border-slate-200/60 bg-slate-100/60 dark:border-teal-500/10 dark:bg-[#071719]/60 opacity-80'
      }`}
      dir="rtl"
    >
      <div
        role="button"
        tabIndex={lecture.isUnlocked ? 0 : -1}
        onClick={() => lecture.isUnlocked && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (lecture.isUnlocked) setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center justify-between p-3.5 sm:p-4 gap-2 transition select-none ${
          lecture.isUnlocked ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-[#0d2628]' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black ${lecture.isUnlocked ? 'bg-bio-teal/10 text-bio-teal dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
            {lecture.order}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{lecture.title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-teal-200/60 mt-0.5 truncate">{lecture.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!lecture.isUnlocked ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">مقفولة (تتطلب 50%)</span>
              <span className="sm:hidden">مقفولة</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex text-[11px] text-slate-400 font-medium">{isOpen ? 'إخفاء المحتويات' : 'عرض المحتويات'}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#071719] text-slate-600 dark:text-teal-300 transition ${isOpen ? 'text-bio-teal dark:text-emerald-400' : ''}`}>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          )}
        </div>
      </div>

      {lecture.isUnlocked && isOpen && (
        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 space-y-2.5 border-t border-slate-100 dark:border-teal-500/15 animate-in fade-in duration-150">
          {/* Element 1: Video */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <PlayCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">{lecture.video.title}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">المدة: {lecture.video.duration} • جودة عالية 1080p</span>
              </div>
            </div>
            <button type="button" onClick={() => onPlayVideo(lecture.video.hlsUrl, lecture.video.title, lecture.id)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition active:scale-95">
              <PlayCircle className="h-3.5 w-3.5" /><span>مشاهدة المحاضرة</span>
            </button>
          </div>

          {/* Element 2: PDF */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">{lecture.pdf.title}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">المذكرة الكاملة • {lecture.pdf.pagesCount} صفحة</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => onOpenPdf(lecture.pdf.title, lecture.pdf.pagesCount)} className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 transition active:scale-95">
                <Eye className="h-3.5 w-3.5" /><span>عرض بالمنصة</span>
              </button>
              <button type="button" onClick={handleOpenExternalPdf} className="inline-flex items-center gap-1 rounded-xl border border-bio-teal/30 dark:border-emerald-500/30 bg-bio-teal/5 hover:bg-bio-teal hover:text-white text-bio-teal dark:text-emerald-300 px-2.5 py-1.5 text-xs font-bold transition active:scale-95">
                <ExternalLink className="h-3.5 w-3.5" /><span>فتح خارجياً</span>
              </button>
              <button type="button" onClick={handleDownloadPdf} className="inline-flex items-center gap-1 rounded-xl bg-bio-teal/10 hover:bg-bio-teal text-bio-teal hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-600 dark:text-emerald-300 dark:hover:text-white px-2.5 py-1.5 text-xs font-bold transition active:scale-95">
                <Download className="h-3.5 w-3.5" /><span>تحميل PDF</span>
              </button>
            </div>
          </div>

          {/* Element 3: Quiz */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">{lecture.quiz.title}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {lecture.quiz.questionsCount} سؤال • {lecture.quiz.durationMinutes} دقيقة
                  {lecture.quiz.isPassed && ` • تم الاجتياز بنتيجة ${lecture.quiz.studentScore}/${lecture.quiz.questionsCount} ✅`}
                </span>
              </div>
            </div>
            <button type="button" onClick={() => onOpenQuizModal(lecture)} className="inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95">
              <Award className="h-3.5 w-3.5" /><span>{lecture.quiz.isPassed ? 'إعادة / تفاصيل الكويز' : 'ابدأ الامتحان الآن'}</span>
            </button>
          </div>

          {/* Element 4: Homework */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">{lecture.homework.title}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {lecture.homework.questionsCount} سؤال • الدرجة: {lecture.homework.totalGrade}
                  {lecture.homework.isSubmitted && ` • تم التسليم (${lecture.homework.studentScore}/${lecture.homework.totalGrade}) ✅`}
                </span>
              </div>
            </div>
            <Link href={`/courses/${courseId}/exam/${lecture.homework.id}?type=homework`} prefetch={false} className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#134647] hover:bg-bio-teal dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95">
              <BookOpen className="h-3.5 w-3.5" /><span>{lecture.homework.isSubmitted ? 'إعادة حل الواجب' : 'ابدأ حل الواجب'}</span>
            </Link>
          </div>

          <LectureSolutionsBlock lecture={lecture} onPlayVideo={onPlayVideo} onOpenPdf={onOpenPdf} onNotify={onNotify} />
        </div>
      )}
    </div>
  );
}
