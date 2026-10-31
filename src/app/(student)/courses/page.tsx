'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { CoursesFilterType } from '@/features/courses/courses-types';
import { CourseCard } from '@/features/courses/CourseCard';
import { CourseItem } from '@/lib/data/courses-types';
import { createClient } from '@/lib/supabase/client';
import { getStoredEnrolledCourses } from '@/lib/utils/student-storage';

export default function StudentCoursesPage() {
  const [filter, setFilter] = useState<CoursesFilterType>('my_courses');
  const [coursesList, setCoursesList] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCoursesFromSupabase = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const coursesPromise = supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      const enrollmentsPromise = session
        ? supabase.from('course_enrollments').select('course_id, status').eq('status', 'active')
        : Promise.resolve({ data: [] });

      const [coursesRes, enrollmentsRes] = await Promise.all([coursesPromise, enrollmentsPromise]);

      const stored = getStoredEnrolledCourses();
      const enrolledSet = new Set<string>();

      if (enrollmentsRes.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        enrollmentsRes.data.forEach((e: any) => enrolledSet.add(e.course_id));
      }
      stored.forEach((s) => enrolledSet.add(s.id));

      if (coursesRes.data && coursesRes.data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: CourseItem[] = coursesRes.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          tagline: c.description || 'منهج الأحياء للثانوية العامة 2027',
          description: c.description || '',
          grade: `الصف ${c.grade_level} الثانوي`,
          price: c.price,
          priceFormatted: c.price === 0 ? 'مجاني' : `${c.price} ج.م`,
          isComprehensive: !!c.is_bundle,
          isEnrolled: enrolledSet.has(c.id),
          isTemporary: false,
          progress: 0,
          bannerImage: c.thumbnail_url || c.banner_image_url || '/images/teacher-circle.png',
          lecturesCount: 12,
          modules: [],
        }));
        setCoursesList(mapped);
      } else {
        setCoursesList([]);
      }
    } catch {
      setCoursesList([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCoursesFromSupabase();
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
      if (isEnrolledInComprehensive && !course.isComprehensive) {
        return false;
      }
      return true;
    }

    if (filter === 'suggested') {
      return !!course.isSuggested;
    }

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
      {isLoading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-400">جارٍ تحميل الكورسات من قاعدة البيانات...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCourses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs font-bold text-slate-400 rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/20 p-8">
              لا توجد كورسات في هذا القسم حالياً
            </div>
          ) : (
            filteredCourses.map((c) => <CourseCard key={c.id} course={c} />)
          )}
        </div>
      )}
    </div>
  );
}
