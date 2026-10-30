'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, Lightbulb, Bookmark } from 'lucide-react';

export default function StudentDashboardPage() {
  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      
      {/* 1. Top Row: 3 Stat Cards (grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {/* Card 1: Completed Courses */}
        <div className="flex items-center justify-between rounded-xl bg-[#134647] dark:bg-[#0D2628] dark:border dark:border-teal-500/20 p-2.5 sm:p-3 text-white shadow-sm transition">
          <div>
            <div className="text-lg sm:text-xl font-black">0</div>
            <div className="text-xs font-semibold mt-0.5 text-teal-100">كورسات مكتملة</div>
          </div>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10">
            <CheckSquare className="h-4 w-4 text-emerald-300" />
          </div>
        </div>

        {/* Card 2: Current Courses */}
        <div className="flex items-center justify-between rounded-xl bg-[#134647] dark:bg-[#0D2628] dark:border dark:border-teal-500/20 p-2.5 sm:p-3 text-white shadow-sm transition">
          <div>
            <div className="text-lg sm:text-xl font-black">1</div>
            <div className="text-xs font-semibold mt-0.5 text-teal-100">كورساتك الحالية</div>
          </div>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10">
            <Lightbulb className="h-4 w-4 text-amber-300" />
          </div>
        </div>

        {/* Card 3: Saved Videos */}
        <div className="flex items-center justify-between rounded-xl bg-[#134647] dark:bg-[#0D2628] dark:border dark:border-teal-500/20 p-2.5 sm:p-3 text-white shadow-sm transition">
          <div>
            <div className="text-lg sm:text-xl font-black">0</div>
            <div className="text-xs font-semibold mt-0.5 text-teal-100">الفيديوهات المحفوظة</div>
          </div>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10">
            <Bookmark className="h-4 w-4 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* 2. Middle Row: "نشاطك التعليمي" (2/3) and "تقدمك" (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
        
        {/* Right (2/3): "نشاطك التعليمي" with Responsive SVG Container */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300">
                نشاطك التعليمي
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  الأسبوع الماضي
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  الأسبوع الحالي
                </span>
              </div>
            </div>

            {/* Responsive Scrollable Container for SVG Chart */}
            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="min-w-[440px] sm:min-w-0 h-32 sm:h-38">
                <svg viewBox="0 0 660 210" className="w-full h-full">
                  {/* Horizontal grid lines */}
                  {[0, 20, 40, 60, 80, 100].map((val, idx) => {
                    const y = 180 - (val / 100) * 150;
                    return (
                      <g key={idx}>
                        <line x1="45" y1={y} x2="645" y2={y} stroke="currentColor" className="text-slate-100 dark:text-teal-900/40" strokeWidth="1" />
                        <text x="35" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 dark:fill-teal-300/50 font-sans">{val}</text>
                      </g>
                    );
                  })}

                  {/* Days of week on X-axis */}
                  {['الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, idx) => {
                    const x = 65 + idx * 90;
                    return (
                      <text key={idx} x={x} y="200" textAnchor="middle" className="text-[10px] font-medium fill-slate-500 dark:fill-teal-200/60 font-sans">{day}</text>
                    );
                  })}

                  {/* Last Week Line (Dashed Green with peak on Sunday) */}
                  <path
                    d="M 65 180 L 155 180 L 245 105 L 335 180 L 425 180 L 515 180 L 605 180"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <circle cx="245" cy="105" r="4" fill="#10B981" />

                  {/* Current Week Line (Solid Red flatline) */}
                  <path
                    d="M 65 180 L 155 180 L 245 180 L 335 180 L 425 180 L 515 180 L 605 180"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="1.5"
                  />
                  {[65, 155, 245, 335, 425, 515, 605].map((cx, i) => (
                    <circle key={i} cx={cx} cy="180" r="2.5" fill="#F43F5E" />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          <p className="mt-1.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-teal-200/60 text-center">
            *ابدأ أول كورس علشان نقدر نعرضلك بيانات نشاطك التعليمية بشكل دقيق!
          </p>
        </div>

        {/* Left (1/3): "تقدمك" Card (Matching Image 5 Arched Outline) */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-2xl border-2 border-[#134647] dark:border-emerald-500/40 bg-white p-3 sm:p-3.5 shadow-sm dark:bg-[#091D20] flex flex-col justify-between text-center">
          {/* Top-Right Decorative Arc matching Image 5 */}
          <div className="absolute top-0 right-0 w-16 h-16 border-b-2 border-l-2 border-[#134647]/20 dark:border-emerald-500/25 rounded-bl-[2.5rem] pointer-events-none" />

          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-1.5 sm:mb-2">
              تقدمك
            </h3>

            {/* Percentage display */}
            <div className="text-xl sm:text-2xl font-black text-[#134647] dark:text-emerald-400 mb-1.5">
              % 21
            </div>

            {/* Progress Bar (Matching Image 5) */}
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#071719] overflow-hidden mb-2.5">
              <div className="h-full bg-gradient-to-r from-red-600 to-red-800 rounded-full w-[21%]" />
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-teal-200/60 leading-relaxed">
            مقياس لكمية الدروس السابقة و المتبقية في كورساتك الحالية!
          </p>
        </div>

      </div>

      {/* 3. Bottom Row: "الكورسات اللي مشترك فيها" (Matching Image 5) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-2">
          الكورسات اللي مشترك فيها
        </h3>
        
        {/* Active Enrolled Course Card */}
        <div className="rounded-xl border border-slate-200/80 dark:border-teal-500/15 bg-slate-50 dark:bg-[#071719] p-2 sm:p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <img
              src="/images/teacher-circle.png"
              alt="كورس الأحياء"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover bg-slate-100 dark:bg-[#0D2628]"
            />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                كورس الباب الأول: الدعامة والحركة
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-teal-200/60 mt-0.5">الصف الثالث الثانوي • متاح للمشاهدة</p>
            </div>
          </div>

          <Link
            href="/courses"
            prefetch={false}
            className="w-full sm:w-auto text-center rounded-xl bg-[#134647] hover:bg-bio-teal dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3.5 py-1 text-xs font-bold shadow-sm transition active:scale-95"
          >
            متابعة المشاهدة
          </Link>
        </div>
      </div>

    </div>
  );
}
