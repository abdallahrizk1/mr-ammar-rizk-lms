'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lock,
  PlayCircle,
  FileText,
  Award,
  BookOpen,
  Download,
  Eye,
} from 'lucide-react';
import { LectureMaterials } from '@/lib/data/courses-types';
import { LectureSolutionsBlock } from './LectureSolutionsBlock';

interface LectureItemProps {
  courseId: string;
  lecture: LectureMaterials;
  onPlayVideo: (hlsUrl: string, title: string, lessonId: string) => void;
  onOpenPdf: (title: string, pagesCount: number) => void;
  onOpenQuizModal: (lecture: LectureMaterials) => void;
}

export function LectureItem({
  courseId,
  lecture,
  onPlayVideo,
  onOpenPdf,
  onOpenQuizModal,
}: LectureItemProps) {
  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 transition ${
        lecture.isUnlocked
          ? 'border-slate-200 bg-white shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]'
          : 'border-slate-200/60 bg-slate-100/60 dark:border-teal-500/10 dark:bg-[#071719]/60 opacity-80'
      }`}
      dir="rtl"
    >
      {/* Lecture Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-teal-500/15">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
              lecture.isUnlocked
                ? 'bg-bio-teal/10 text-bio-teal dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
            }`}
          >
            {lecture.order}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {lecture.title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-teal-200/60 mt-0.5">
              {lecture.description}
            </p>
          </div>
        </div>

        {!lecture.isUnlocked && (
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 self-start sm:self-auto border border-amber-500/20">
            <Lock className="h-3.5 w-3.5" />
            <span>مقفولة (تتطلب 50% في المحاضرة السابقة)</span>
          </div>
        )}
      </div>

      {lecture.isUnlocked ? (
        <div className="mt-3.5 space-y-2.5">
          {/* Element 1: Video */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <PlayCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {lecture.video.title}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  المدة: {lecture.video.duration} • مشغل HLS HD
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onPlayVideo(lecture.video.hlsUrl, lecture.video.title, lecture.id)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>مشاهدة الفيديو</span>
            </button>
          </div>

          {/* Element 2: PDF */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {lecture.pdf.title}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  المذكرة الكاملة • {lecture.pdf.pagesCount} صفحة
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenPdf(lecture.pdf.title, lecture.pdf.pagesCount)}
                className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 text-xs font-bold hover:bg-slate-100 transition"
              >
                <Eye className="h-3 w-3" />
                <span>قراءة المذكرة داخل المنصة</span>
              </button>
              <button
                type="button"
                onClick={() => alert('تم بدء تحميل المذكرة مباشرة')}
                className="inline-flex items-center gap-1 rounded-xl bg-bio-teal/10 hover:bg-bio-teal text-bio-teal hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-600 dark:text-emerald-300 dark:hover:text-white px-2.5 py-1.5 text-xs font-bold transition"
              >
                <Download className="h-3 w-3" />
                <span>تحميل PDF</span>
              </button>
            </div>
          </div>

          {/* Element 3: Quiz */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {lecture.quiz.title}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {lecture.quiz.questionsCount} سؤال • {lecture.quiz.durationMinutes} دقيقة
                  {lecture.quiz.isPassed && ` • تم الاجتياز بنتيجة ${lecture.quiz.studentScore}/${lecture.quiz.questionsCount} ✅`}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenQuizModal(lecture)}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Award className="h-3.5 w-3.5" />
              <span>{lecture.quiz.isPassed ? 'إعادة / تفاصيل الكويز' : 'ابدأ الامتحان الآن'}</span>
            </button>
          </div>

          {/* Element 4: Homework */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {lecture.homework.title}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {lecture.homework.questionsCount} سؤال • الدرجة: {lecture.homework.totalGrade}
                  {lecture.homework.isSubmitted && ` • تم التسليم (${lecture.homework.studentScore}/${lecture.homework.totalGrade}) ✅`}
                </span>
              </div>
            </div>
            <Link
              href={`/courses/${courseId}/exam/${lecture.homework.id}?type=homework`}
              prefetch={false}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#134647] hover:bg-bio-teal dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>{lecture.homework.isSubmitted ? 'إعادة حل الواجب' : 'ابدأ حل الواجب'}</span>
            </Link>
          </div>

          {/* Element 5: Locked / Unlocked Solution Videos & PDFs */}
          <LectureSolutionsBlock
            lecture={lecture}
            onPlayVideo={onPlayVideo}
            onOpenPdf={onOpenPdf}
          />
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-teal-200/60 space-y-1">
          <p className="font-bold">هذه المحاضرة مقفولة حالياً 🔒</p>
          <p className="text-[11px]">يجب عليك تسليم كويز وواجب المحاضرة السابقة وتحقيق 50% على الأقل لفتحها تلقائياً.</p>
        </div>
      )}
    </div>
  );
}
