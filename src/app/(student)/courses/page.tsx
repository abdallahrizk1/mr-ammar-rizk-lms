'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, PlayCircle, CheckCircle2, Clock } from 'lucide-react';

const STUDENT_COURSES = [
  {
    id: 'c-1',
    title: 'كورس الباب الأول: الدعامة والحركة في الكائنات الحية',
    grade: 'الصف الثالث الثانوي',
    lessonsCount: 12,
    completedCount: 3,
    progress: 25,
    status: 'enrolled',
  },
  {
    id: 'c-2',
    title: 'كورس الامتحان التأسيسي الشامل في الأحياء',
    grade: 'جميع الصفوف',
    lessonsCount: 4,
    completedCount: 4,
    progress: 100,
    status: 'completed',
  },
  {
    id: 'c-3',
    title: 'كورس الباب الثاني: التنسيق الهرموني في الكائنات الحية',
    grade: 'الصف الثالث الثانوي',
    lessonsCount: 10,
    completedCount: 0,
    progress: 0,
    status: 'available',
    price: '350 جنيه',
  },
];

export default function StudentCoursesPage() {
  const [tab, setTab] = useState<'all' | 'enrolled' | 'completed'>('all');

  const filtered = STUDENT_COURSES.filter((c) => {
    if (tab === 'enrolled') return c.status === 'enrolled';
    if (tab === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div>
          <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
            <span>الكورسات والمحتوى الدراسي</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            تابع دروسك المشترك بها أو تصفح الكورسات المتاحة للانضمام
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'enrolled', label: 'كورساتي الحالية' },
            { id: 'completed', label: 'المكتملة' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as 'all' | 'enrolled' | 'completed')}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                tab === item.id
                  ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#0D2628] dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] transition hover:shadow-md"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <img
                  src="/images/teacher-circle.png"
                  alt={course.title}
                  className="h-11 w-11 rounded-xl object-cover bg-slate-100 dark:bg-[#0D2628] shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-bio-teal dark:text-emerald-400 block">
                    {course.grade}
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {course.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-teal-200/70 mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {course.lessonsCount} حصة ومحاضرة
                </span>
                {course.status !== 'available' ? (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    تم إنجاز {course.progress}%
                  </span>
                ) : (
                  <span className="font-black text-bio-teal dark:text-emerald-400">
                    {course.price}
                  </span>
                )}
              </div>

              {course.status !== 'available' && (
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#071719] overflow-hidden mb-3">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              )}
            </div>

            <Link
              href="/dashboard"
              prefetch={false}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#134647] hover:bg-bio-teal dark:bg-emerald-600 dark:hover:bg-emerald-500 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
            >
              {course.status === 'completed' ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>مراجعة الكورس المكتمل</span>
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  <span>{course.status === 'enrolled' ? 'متابعة الدروس' : 'تفعيل الاشتراك'}</span>
                </>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
