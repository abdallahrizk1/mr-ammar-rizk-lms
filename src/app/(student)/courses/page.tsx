'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { CoursesFilterType } from '@/features/courses/courses-types';
import { CourseCard } from '@/features/courses/CourseCard';
import { CourseItem } from '@/lib/data/courses-types';
import { SAMPLE_COURSES } from '@/lib/data/courses-data';
import { getStoredEnrolledCourses } from '@/lib/utils/student-storage';

export default function StudentCoursesPage() {
  const [filter, setFilter] = useState<CoursesFilterType>('my_courses');
  const [coursesList, setCoursesList] = useState<CourseItem[]>(SAMPLE_COURSES);

  useEffect(() => {
    // Sync with student storage for any dynamically activated courses
    const stored = getStoredEnrolledCourses();
    setCoursesList((prev) =>
      prev.map((c) => {
        const found = stored.find((s) => s.id === c.id);
        if (found) {
          return {
            ...c,
            isEnrolled: true,
            isTemporary: found.status === 'temporary',
          };
        }
        return c;
      })
    );
  }, []);

  // Filter 1: كورساتي (Enrolled courses; if enrolled in comprehensive, show 1 unified card without repeating chapters)
  // Filter 2: جميع الكورسات (All courses)
  // Filter 3: كورساتنا المقترحة (Suggested courses)
  const filteredCourses = coursesList.filter((course) => {
    if (filter === 'my_courses') {
      if (!course.isEnrolled) return false;
      const isEnrolledInComprehensive = coursesList.some(
        (c) => c.isComprehensive && c.isEnrolled
      );
      // If student is enrolled in comprehensive, hide individual chapter courses in 'my_courses'
      if (isEnrolledInComprehensive && !course.isComprehensive && course.id.startsWith('c-chapter-')) {
        return false;
      }
      return true;
    }

    if (filter === 'suggested') {
      return !!course.isSuggested;
    }

    // 'all'
    return true;
  });

  const filterButtons: { id: CoursesFilterType; label: string }[] = [
    { id: 'my_courses', label: 'كورساتي' },
    { id: 'all', label: 'جميع الكورسات' },
    { id: 'suggested', label: 'كورساتنا المقترحة' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      {/* Top Header & 3-filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div>
          <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
            <span>الكورسات والمحتوى الدراسي</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            تصفح مقرراتك المشترك بها أو اكتشف الكورسات المتاحة والمقترحة
          </p>
        </div>

        {/* 3 Filters verbatim */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto no-scrollbar">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setFilter(btn.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                filter === btn.id
                  ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#071719] dark:text-slate-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs font-bold text-slate-400 rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/20 p-8">
            لا توجد كورسات في هذا القسم حالياً
          </div>
        ) : (
          filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    </div>
  );
}
