'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Calendar, Clock, BookOpen } from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  image: string;
  category: 'grade1' | 'grade2' | 'grade3' | 'free';
  isFree?: boolean;
  price?: string;
  date: string;
  note: string;
}

const COURSES: CourseItem[] = [
  {
    id: 'c1',
    title: 'كورس الامتحان التأسيسي في الأحياء',
    image: '/images/teacher-circle.png',
    category: 'free',
    isFree: true,
    date: 'الأحد، 2 أغسطس 2026',
    note: 'الامتحان متاح لمدة 48 ساعة مجاناً',
  },
  {
    id: 'c2',
    title: 'كورس الباب الأول والثاني (3 شهور) - عام',
    image: '/images/teacher-circle.png',
    category: 'grade3',
    price: '350 جنيه',
    date: 'الأحد، 26 يوليو 2026',
    note: 'بداية نزول المحتوى يوم 8/8',
  },
  {
    id: 'c3',
    title: 'كورس الباب الأول والثاني - أزهر',
    image: '/images/teacher-circle.png',
    category: 'grade3',
    price: '350 جنيه',
    date: 'الأحد، 26 يوليو 2026',
    note: 'بداية نزول المحتوى يوم 8/8',
  },
  {
    id: 'c4',
    title: 'أساسيات علم الأحياء والوراثة - الصف الأول',
    image: '/images/teacher-circle.png',
    category: 'grade1',
    price: '250 جنيه',
    date: 'السبت، 1 أغسطس 2026',
    note: 'شرح المنهج وحل تدريبات تفاعلية',
  },
  {
    id: 'c5',
    title: 'كورس التغذية والنقل في الكائنات - الصف الثاني',
    image: '/images/teacher-circle.png',
    category: 'grade2',
    price: '280 جنيه',
    date: 'الإثنين، 3 أغسطس 2026',
    note: 'رسومات ثلاثية الأبعاد واختبارات دورية',
  },
  {
    id: 'c6',
    title: 'بنك أسئلة الوزارة ونماذج الامتحانات - مجاني',
    image: '/images/teacher-circle.png',
    category: 'free',
    isFree: true,
    date: 'متاح طوال العام',
    note: 'أكثر من 500 سؤال تدريبي مجاني',
  },
];

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'grade1', label: 'الصف الأول' },
  { id: 'grade2', label: 'الصف الثاني' },
  { id: 'grade3', label: 'الصف الثالث' },
  { id: 'free', label: 'مجاني' },
];

export function AvailableCoursesSection() {
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredCourses = activeFilter === 'all'
    ? COURSES
    : activeFilter === 'free'
    ? COURSES.filter((c) => c.isFree)
    : COURSES.filter((c) => c.category === activeFilter);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8 sm:py-14 bg-slate-50 dark:bg-slate-900/60 transition-colors" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
              كورساتنا المتاحة للعام 2026/2027 🧬
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              اختر صفك الدراسي وابدأ التعلم بأعلى معايير الفهم والتطبيق
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={scrollRight}
              aria-label="السابق"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-bio-teal hover:text-white dark:hover:bg-bio-teal"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="التالي"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-bio-teal hover:text-white dark:hover:bg-bio-teal"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grade Filters Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-bio-teal text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
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
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x pb-4 pt-1 no-scrollbar"
        >
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="w-[280px] sm:w-[320px] shrink-0 snap-start flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition hover:shadow-md text-right"
              >
                <div>
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 mb-3 flex items-center justify-center">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-28 w-28 object-contain"
                    />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                    {course.title}
                  </h3>

                  <div className="mt-2.5">
                    {course.isFree ? (
                      <span className="inline-block rounded-md border border-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                        كورس مجاني
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base font-black text-bio-teal dark:text-emerald-400">
                        {course.price}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{course.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{course.note}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href="/register"
                    prefetch={false}
                    className="flex w-full items-center justify-center rounded-xl border-2 border-bio-teal py-2 text-xs sm:text-sm font-bold text-bio-teal transition hover:bg-bio-teal hover:text-white dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-slate-950 active:scale-95"
                  >
                    الدخول للكورس
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              لا توجد كورسات متاحة حالياً في هذا التصنيف.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
