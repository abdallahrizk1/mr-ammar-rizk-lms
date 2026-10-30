'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { CourseItem } from '@/lib/data/courses-types';

interface CourseHeaderProps {
  course: CourseItem;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <img
            src={course.bannerImage || '/images/teacher-circle.png'}
            alt={course.title}
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover bg-slate-100 dark:bg-[#071719] shrink-0 border border-slate-200/80 dark:border-teal-500/20 shadow-sm"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-bio-teal dark:text-emerald-400">
                {course.grade}
              </span>
              {course.isEnrolled ? (
                course.isTemporary ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold">
                    <AlertCircle className="h-3 w-3" />
                    تفعيل مؤقت لحين مراجعة الأدمن
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                    <CheckCircle2 className="h-3 w-3" />
                    مشترك ومفعل بالكامل
                  </span>
                )
              ) : (
                <span className="rounded-full bg-slate-100 dark:bg-[#071719] text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                  غير مشترك
                </span>
              )}
            </div>

            <h1 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              {course.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-teal-200/70 mt-1 max-w-2xl leading-relaxed">
              {course.tagline || course.description}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-teal-500/10">
          <div>
            <span className="text-[11px] text-slate-400 dark:text-teal-300/60 block text-right">
              {course.isEnrolled ? 'نسبة التقدم الدراسي' : 'قيمة الكورس'}
            </span>
            <div className="text-base sm:text-xl font-black text-bio-teal dark:text-emerald-400">
              {course.isEnrolled ? `${course.progress}%` : course.priceFormatted}
            </div>
          </div>

          {!course.isEnrolled && (
            <Link
              href={`/courses/${course.id}/subscribe`}
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              <span>الاشتراك وتفعيل الكورس</span>
            </Link>
          )}
        </div>
      </div>

      {course.isEnrolled && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-teal-500/15">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-teal-200/70 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>إجمالي المحاضرات: {course.lecturesCount} محاضرة</span>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              أنجزت {course.progress}% من محتوى الكورس
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#071719] overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
