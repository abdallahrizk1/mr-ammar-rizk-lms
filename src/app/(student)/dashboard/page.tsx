'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Lightbulb, Bookmark } from 'lucide-react';

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6" dir="rtl">
      
      {/* 1. Top Row: 3 Stat Cards (Matching Image 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Completed Courses */}
        <div className="flex items-center justify-between rounded-2xl bg-[#134647] p-5 text-white shadow-sm">
          <div>
            <div className="text-3xl font-black">0</div>
            <div className="text-xs sm:text-sm font-semibold mt-1">كورسات مكتملة</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <CheckSquare className="h-6 w-6 text-[#6EE7B7]" />
          </div>
        </div>

        {/* Card 2: Current Courses */}
        <div className="flex items-center justify-between rounded-2xl bg-[#134647] p-5 text-white shadow-sm">
          <div>
            <div className="text-3xl font-black">1</div>
            <div className="text-xs sm:text-sm font-semibold mt-1">كورساتك الحالية</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <Lightbulb className="h-6 w-6 text-amber-300" />
          </div>
        </div>

        {/* Card 3: Saved Videos */}
        <div className="flex items-center justify-between rounded-2xl bg-[#134647] p-5 text-white shadow-sm">
          <div>
            <div className="text-3xl font-black">0</div>
            <div className="text-xs sm:text-sm font-semibold mt-1">الفيديوهات المحفوظة</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
            <Bookmark className="h-6 w-6 text-[#6EE7B7]" />
          </div>
        </div>
      </div>

      {/* 2. Middle Row: "نشاطك التعليمي" (2/3) and "تقدمك" (1/3) (Matching Image 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Right (2/3): "نشاطك التعليمي" with Dashed Line Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                نشاطك التعليمي
              </h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  الأسبوع الماضي
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  الأسبوع الحالي
                </span>
              </div>
            </div>

            {/* SVG Dashed Line Chart */}
            <div className="w-full h-48 sm:h-56">
              <svg viewBox="0 0 700 220" className="w-full h-full">
                {/* Horizontal grid lines */}
                {[0, 20, 40, 60, 80, 100].map((val, idx) => {
                  const y = 190 - (val / 100) * 160;
                  return (
                    <g key={idx}>
                      <line x1="50" y1={y} x2="680" y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                      <text x="35" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-sans">{val}</text>
                    </g>
                  );
                })}

                {/* Days of week on X-axis */}
                {['الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, idx) => {
                  const x = 70 + idx * 95;
                  return (
                    <text key={idx} x={x} y="210" textAnchor="middle" className="text-[11px] fill-slate-500 font-sans">{day}</text>
                  );
                })}

                {/* Last Week Line (Dashed Green with peak on Sunday) */}
                <path
                  d="M 70 190 L 165 190 L 260 110 L 355 190 L 450 190 L 545 190 L 640 190"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeDasharray="5,5"
                />
                <circle cx="260" cy="110" r="4.5" fill="#10B981" />

                {/* Current Week Line (Solid Red flatline) */}
                <path
                  d="M 70 190 L 165 190 L 260 190 L 355 190 L 450 190 L 545 190 L 640 190"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="2"
                />
                {[70, 165, 260, 355, 450, 545, 640].map((cx, i) => (
                  <circle key={i} cx={cx} cy="190" r="3" fill="#F43F5E" />
                ))}
              </svg>
            </div>
          </div>

          {/* Footnote matching Image 5 */}
          <p className="mt-3 text-xs text-slate-400 text-center">
            *ابدأ أول كورس علشان نقدر نعرضلك بيانات نشاطك التعليمية بشكل دقيق!
          </p>
        </div>

        {/* Left (1/3): "تقدمك" Card (Matching Image 5) */}
        <div className="lg:col-span-4 rounded-2xl border-2 border-[#134647] dark:border-[#34D399] bg-white p-6 shadow-sm dark:bg-slate-900 flex flex-col justify-between text-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">
              تقدمك
            </h3>

            {/* Percentage display */}
            <div className="text-4xl font-black text-[#134647] dark:text-[#34D399] mb-4">
              % 21
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-red-600 to-red-800 rounded-full w-[21%]" />
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            مقياس لكمية الدروس السابقة و المتبقية في كورساتك الحالية!
          </p>
        </div>

      </div>

      {/* 3. Bottom Row: "الكورسات اللي مشترك فيها" (Matching Image 5) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          الكورسات اللي مشترك فيها
        </h3>
        
        {/* Active Enrolled Course Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/images/teacher-ammar.jpg"
              alt="كورس"
              className="h-16 w-16 rounded-xl object-cover object-top"
            />
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                كورس الباب الأول: الدعامة والحركة
              </h4>
              <p className="text-xs text-slate-500 mt-1">الصف الثالث الثانوي • متاح للمشاهدة</p>
            </div>
          </div>

          <Link
            href="/courses"
            prefetch={false}
            className="rounded-xl bg-[#134647] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#0D9488] transition"
          >
            متابعة المشاهدة
          </Link>
        </div>
      </div>

    </div>
  );
}
