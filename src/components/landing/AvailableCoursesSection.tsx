'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, Calendar, Clock } from 'lucide-react';

interface CourseItem {
  id: string;
  title: string;
  image: string;
  isFree?: boolean;
  price?: string;
  date: string;
  note: string;
}

const COURSES: CourseItem[] = [
  {
    id: 'c1',
    title: 'كورس الامتحان التأسيسي',
    image: '/images/teacher-circle.png',
    isFree: true,
    date: 'الأحد، 2 أغسطس 2026',
    note: 'الامتحان متاح لمدة 48 ساعة',
  },
  {
    id: 'c2',
    title: 'كورس الباب الأول والثاني (3 شهور) - عام',
    image: '/images/teacher-circle.png',
    price: '350 جنيه',
    date: 'الأحد، 26 يوليو 2026',
    note: 'بداية نزول المحتوى يوم 8/8',
  },
  {
    id: 'c3',
    title: 'كورس الباب الأول والثاني - أزهر',
    image: '/images/teacher-circle.png',
    price: '350 جنيه',
    date: 'الأحد، 26 يوليو 2026',
    note: 'بداية نزول المحتوى يوم 8/8',
  },
];

export function AvailableCoursesSection() {
  const [startIndex, setStartIndex] = useState(0);

  const prevSlide = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : COURSES.length - 1));
  };

  const nextSlide = () => {
    setStartIndex((prev) => (prev < COURSES.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="py-8 sm:py-14 bg-slate-50 dark:bg-slate-900/60" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with "الكل" Filter & Slider Arrows */}
        <div className="flex flex-row items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1 text-xs font-bold"
            >
              الكل
            </button>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
              كورساتنا المتاحة للعام 2026/2027
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="السابق"
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition hover:border-[#134647] hover:text-[#134647]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="التالي"
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition hover:border-[#134647] hover:text-[#134647]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {COURSES.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-right"
            >
              <div>
                {/* Course Image */}
                <div className="relative h-36 sm:h-40 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 mb-3">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Course Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {course.title}
                </h3>

                {/* Price or Free Badge */}
                <div className="mt-2">
                  {course.isFree ? (
                    <span className="inline-block rounded-md border border-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                      كورس مجاني
                    </span>
                  ) : (
                    <span className="text-sm sm:text-base font-black text-[#134647] dark:text-[#34D399]">
                      {course.price}
                    </span>
                  )}
                </div>

                {/* Date & Note Info */}
                <div className="mt-3 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{course.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{course.note}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                <Link
                  href="/register"
                  prefetch={false}
                  className="flex w-full items-center justify-center rounded-lg border-2 border-[#134647] dark:border-[#34D399] py-2 text-xs sm:text-sm font-bold text-[#134647] dark:text-[#34D399] transition hover:bg-[#134647] hover:text-white dark:hover:bg-[#34D399] dark:hover:text-slate-950"
                >
                  الدخول للكورس
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
