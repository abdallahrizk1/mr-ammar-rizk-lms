'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, PlayCircle, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CourseItem } from '@/lib/data/courses-types';

interface CourseCardProps {
  course: CourseItem;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] transition hover:shadow-md">
      <div>
        <div className="flex items-center gap-3 mb-2.5">
          <img
            src={course.bannerImage || '/images/teacher-circle.png'}
            alt={course.title}
            className="h-12 w-12 rounded-xl object-cover bg-slate-100 dark:bg-[#071719] shrink-0 border border-slate-100 dark:border-teal-500/20"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400">
                {course.grade}
              </span>
              {course.isComprehensive && (
                <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 text-[9px] font-black">
                  الكورس الشامل الموحد
                </span>
              )}
              {course.isTemporary && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 text-[9px] font-bold">
                  <AlertCircle className="h-2.5 w-2.5" />
                  مفعل مؤقتاً
                </span>
              )}
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5">
              {course.title}
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-teal-200/60 line-clamp-2 mb-3">
          {course.tagline || course.description}
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-teal-200/70 mb-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.lecturesCount} حصة ومحاضرة
          </span>
          {course.isEnrolled ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              تم إنجاز {course.progress}%
            </span>
          ) : (
            <span className="font-black text-bio-teal dark:text-emerald-400 text-xs sm:text-sm">
              {course.priceFormatted}
            </span>
          )}
        </div>

        {course.isEnrolled && (
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#071719] overflow-hidden mb-3">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}
      </div>

      <div className="pt-2">
        {course.isEnrolled ? (
          <Link
            href={`/courses/${course.id}`}
            prefetch={false}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
          >
            <PlayCircle className="h-4 w-4" />
            <span>متابعة محتوى الكورس</span>
          </Link>
        ) : (
          <Link
            href={`/courses/${course.id}/subscribe`}
            prefetch={false}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#134647] hover:bg-bio-teal dark:bg-emerald-600 dark:hover:bg-emerald-500 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
          >
            <CreditCard className="h-4 w-4" />
            <span>تفعيل الاشتراك الآن</span>
          </Link>
        )}
      </div>
    </div>
  );
}
