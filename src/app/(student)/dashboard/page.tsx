'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Lightbulb, Bookmark } from 'lucide-react';

export default function StudentDashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      
      {/* 1. Top Row: 3 Stat Cards (grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Card 1: Completed Courses */}
        <div className="flex items-center justify-between rounded-2xl bg-[#134647] dark:bg-[#0c3233] p-4 sm:p-5 text-white shadow-sm transition">
          <div>
            <div className="text-2xl sm:text-3xl font-black">0</div>
            <div className="text-xs sm:text-sm font-semibold mt-1 text-slate-200">كورسات مكتملة</div>
          </div>
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/10">
            <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300" />
          </div>
        </div>

        {/* Card 2: Current Courses */}
        <div className="flex items-center justify-between rounded-2xl bg-[#134647] dark:bg-[#0c3233] p-4 sm:p-5 text-white shadow-sm transition">
          <div>
            <div className="text-2xl sm:text-3xl font-black">1</div>
            <div className="text-xs sm:text-sm font-semibold mt-1 text-slate-200">كورساتك الحالية</div>
          </div>
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/10">
            <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-amber-300" />
          </div>
        </div>

        {/* Card 3: Saved Videos */}
        <div className="flex items-center justify-between rounded-2xl bg-[#134647] dark:bg-[#0c3233] p-4 sm:p-5 text-white shadow-sm transition">
          <div>
            <div className="text-2xl sm:text-3xl font-black">0</div>
            <div className="text-xs sm:text-sm font-semibold mt-1 text-slate-200">الفيديوهات المحفوظة</div>
          </div>
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/10">
            <Bookmark className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* 2. Middle Row: "نشاطك التعليمي" (2/3) and "تقدمك" (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        
        {/* Right (2/3): "نشاطك التعليمي" with Responsive SVG Container */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                نشاطك التعليمي
              </h3>
              <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  الأسبوع الماضي
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  الأسبوع الحالي
                </span>
              </div>
            </div>

            {/* Responsive Scrollable Container for SVG Chart */}
            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="min-w-[460px] sm:min-w-0 h-44 sm:h-52">
                <svg viewBox="0 0 660 210" className="w-full h-full">
                  {/* Horizontal grid lines */}
                  {[0, 20, 40, 60, 80, 100].map((val, idx) => {
                    const y = 180 - (val / 100) * 150;
                    return (
                      <g key={idx}>
                        <line x1="45" y1={y} x2="645" y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="1" />
                        <text x="35" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-sans">{val}</text>
                      </g>
                    );
                  })}

                  {/* Days of week on X-axis */}
                  {['الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, idx) => {
                    const x = 65 + idx * 90;
                    return (
                      <text key={idx} x={x} y="200" textAnchor="middle" className="text-[11px] font-medium fill-slate-500 font-sans">{day}</text>
                    );
                  })}

                  {/* Last Week Line (Dashed Green with peak on Sunday) */}
                  <path
                    d="M 65 180 L 155 180 L 245 105 L 335 180 L 425 180 L 515 180 L 605 180"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeDasharray="5,5"
                  />
                  <circle cx="245" cy="105" r="4.5" fill="#10B981" />

                  {/* Current Week Line (Solid Red flatline) */}
                  <path
                    d="M 65 180 L 155 180 L 245 180 L 335 180 L 425 180 L 515 180 L 605 180"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2"
                  />
                  {[65, 155, 245, 335, 425, 515, 605].map((cx, i) => (
                    <circle key={i} cx={cx} cy="180" r="3" fill="#F43F5E" />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400 text-center">
            *ابدأ أول كورس علشان نقدر نعرضلك بيانات نشاطك التعليمية بشكل دقيق!
          </p>
        </div>

        {/* Left (1/3): "تقدمك" Card (Matching Image 5 Arched Outline) */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-3xl border-2 border-[#134647] dark:border-emerald-500 bg-white p-5 sm:p-6 shadow-sm dark:bg-slate-900 flex flex-col justify-between text-center">
          {/* Top-Right Decorative Arc matching Image 5 */}
          <div className="absolute top-0 right-0 w-20 h-20 border-b-2 border-l-2 border-[#134647]/20 dark:border-emerald-500/30 rounded-bl-[3.5rem] pointer-events-none" />

          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
              تقدمك
            </h3>

            {/* Percentage display */}
            <div className="text-3xl sm:text-4xl font-black text-[#134647] dark:text-emerald-400 mb-4">
              % 21
            </div>

            {/* Progress Bar (Matching Image 5) */}
            <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-red-600 to-red-800 rounded-full w-[21%]" />
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            مقياس لكمية الدروس السابقة و المتبقية في كورساتك الحالية!
          </p>
        </div>

      </div>

      {/* 3. Bottom Row: "الكورسات اللي مشترك فيها" (Matching Image 5) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
          الكورسات اللي مشترك فيها
        </h3>
        
        {/* Active Enrolled Course Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <img
              src="/images/teacher-circle.png"
              alt="كورس الأحياء"
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800"
            />
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                كورس الباب الأول: الدعامة والحركة
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">الصف الثالث الثانوي • متاح للمشاهدة</p>
            </div>
          </div>

          <Link
            href="/courses"
            prefetch={false}
            className="w-full sm:w-auto text-center rounded-xl bg-[#134647] hover:bg-bio-teal text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
          >
            متابعة المشاهدة
          </Link>
        </div>
      </div>

    </div>
  );
}
