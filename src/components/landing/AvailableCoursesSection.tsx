'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Calendar, BookOpen, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DynamicCourse {
  id: string;
  title: string;
  grade_level: string;
  price: number;
  banner_image_url: string | null;
  created_at: string;
  description: string | null;
}

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: '1', label: 'الصف الأول' },
  { id: '2', label: 'الصف الثاني' },
  { id: '3', label: 'الصف الثالث' },
  { id: 'free', label: 'مجاني' },
];

export function AvailableCoursesSection() {
  const [courses, setCourses] = useState<DynamicCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('courses')
          .select('id, title, grade_level, price, banner_image_url, created_at, description')
          .eq('is_published', true)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (data) setCourses(data);
      } catch {}
      setIsLoading(false);
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'free') return c.price === 0;
    return c.grade_level === activeFilter;
  });

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-4 sm:py-5 lg:py-6 bg-slate-50 dark:bg-[#071719] transition-colors" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 mb-3 sm:mb-4">
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 dark:text-emerald-300">
              كورساتنا المتاحة للعام 2026/2027 🧬
            </h2>
            <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
              اختر صفك الدراسي وابدأ التعلم بأعلى معايير الفهم والتطبيق
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <button
              type="button"
              onClick={scrollRight}
              aria-label="السابق"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-teal-500/25 bg-white dark:bg-[#0D2628] text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-bio-teal hover:text-white dark:hover:bg-emerald-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="التالي"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-teal-500/25 bg-white dark:bg-[#0D2628] text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-bio-teal hover:text-white dark:hover:bg-emerald-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grade Filters Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-bio-teal dark:bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-[#0D2628] dark:text-slate-300 dark:border-teal-500/20 dark:hover:bg-[#123639]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Courses Horizontal Scroll Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2.5 sm:gap-3.5 overflow-x-auto scroll-smooth snap-x pb-2.5 pt-0.5 no-scrollbar"
        >
          {isLoading ? (
            <div className="w-full py-8 text-center text-xs text-slate-400">جارٍ جلب الكورسات...</div>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="w-[225px] sm:w-[250px] shrink-0 snap-start flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-sm dark:border-teal-500/20 dark:bg-[#0D2628] transition hover:shadow-md text-right"
              >
                <div>
                  <div className="relative h-24 sm:h-28 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-[#071719] mb-2 flex items-center justify-center border border-slate-200/50 dark:border-teal-500/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={course.banner_image_url || '/images/teacher-circle.png'}
                      alt={course.title}
                      className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                    />
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {course.title}
                  </h3>

                  <div className="mt-1.5">
                    {course.price === 0 ? (
                      <span className="inline-block rounded-md border border-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        كورس مجاني
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-black text-bio-teal dark:text-emerald-400">
                        {course.price} ج.م
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1 border-t border-slate-100 dark:border-teal-500/15 pt-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-teal-200/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-400 dark:text-teal-300/60" />
                      <span>الصف {course.grade_level} الثانوي</span>
                    </div>
                    {course.description && (
                      <p className="line-clamp-1 text-[10px] text-slate-400">{course.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2.5">
                  <Link
                    href={`/courses/${course.id}`}
                    prefetch={false}
                    className="flex w-full items-center justify-center rounded-xl border border-bio-teal py-1 text-xs font-bold text-bio-teal transition hover:bg-bio-teal hover:text-white dark:border-emerald-500/50 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white active:scale-95"
                  >
                    الدخول للكورس
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-10 text-center text-xs sm:text-sm font-bold text-slate-500 dark:text-teal-200/70 border border-dashed rounded-2xl p-6">
              سيتم نشر الكورسات قريباً 🧬
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
