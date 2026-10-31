'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Lightbulb, Bookmark, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function StudentDashboardPage() {
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['student_dashboard_data'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_student_dashboard_data');
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const profile = dashboardData?.profile;
  const stats = dashboardData?.student_stats || { mistakes_count: 0, completed_lessons_count: 0 };
  const enrolledCourses = dashboardData?.enrolled_courses || [];
  const recentExams = dashboardData?.recent_exam_attempts || [];

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      {/* Top Row: 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        {/* Card 1: Completed Lessons */}
        <div className="flex items-center justify-between rounded-xl bg-[#134647] dark:bg-[#0D2628] dark:border dark:border-teal-500/20 p-2.5 sm:p-3 text-white shadow-sm transition">
          <div>
            <div className="text-lg sm:text-xl font-black">{isLoading ? '...' : stats.completed_lessons_count}</div>
            <div className="text-xs font-semibold mt-0.5 text-teal-100">محاضرات مكتملة</div>
          </div>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10">
            <CheckSquare className="h-4 w-4 text-emerald-300" />
          </div>
        </div>

        {/* Card 2: Current Courses */}
        <div className="flex items-center justify-between rounded-xl bg-[#134647] dark:bg-[#0D2628] dark:border dark:border-teal-500/20 p-2.5 sm:p-3 text-white shadow-sm transition">
          <div>
            <div className="text-lg sm:text-xl font-black">{isLoading ? '...' : enrolledCourses.length}</div>
            <div className="text-xs font-semibold mt-0.5 text-teal-100">كورساتك الحالية</div>
          </div>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10">
            <Lightbulb className="h-4 w-4 text-amber-300" />
          </div>
        </div>

        {/* Card 3: Mistakes Bank Count */}
        <div className="flex items-center justify-between rounded-xl bg-[#134647] dark:bg-[#0D2628] dark:border dark:border-teal-500/20 p-2.5 sm:p-3 text-white shadow-sm transition">
          <div>
            <div className="text-lg sm:text-xl font-black">{isLoading ? '...' : stats.mistakes_count}</div>
            <div className="text-xs font-semibold mt-0.5 text-teal-100">أسئلة بنك الأخطاء</div>
          </div>
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10">
            <Bookmark className="h-4 w-4 text-emerald-300" />
          </div>
        </div>
      </div>

      {/* Middle Row: "نشاطك التعليمي" (2/3) and "تقدمك" (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
        {/* Right (2/3): Activity SVG Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300">
                نشاطك التعليمي الأسبوعي
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

            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="min-w-[440px] sm:min-w-0 h-32 sm:h-36">
                <svg viewBox="0 0 660 210" className="w-full h-full">
                  {[0, 20, 40, 60, 80, 100].map((val, idx) => {
                    const y = 180 - (val / 100) * 150;
                    return (
                      <g key={idx}>
                        <line x1="45" y1={y} x2="645" y2={y} stroke="currentColor" className="text-slate-100 dark:text-teal-900/40" strokeWidth="1" />
                        <text x="35" y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 dark:fill-teal-300/50 font-sans">{val}</text>
                      </g>
                    );
                  })}
                  {['الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, idx) => {
                    const x = 65 + idx * 90;
                    return (
                      <text key={idx} x={x} y="200" textAnchor="middle" className="text-[10px] font-medium fill-slate-500 dark:fill-teal-200/60 font-sans">{day}</text>
                    );
                  })}
                  <path d="M 65 180 L 155 180 L 245 105 L 335 180 L 425 180 L 515 180 L 605 180" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
                  <circle cx="245" cy="105" r="4" fill="#10B981" />
                  <path d="M 65 180 L 155 180 L 245 180 L 335 180 L 425 180 L 515 180 L 605 180" fill="none" stroke="#F43F5E" strokeWidth="1.5" />
                  {[65, 155, 245, 335, 425, 515, 605].map((cx, i) => (
                    <circle key={i} cx={cx} cy="180" r="2.5" fill="#F43F5E" />
                  ))}
                </svg>
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] sm:text-[11px] text-slate-400 dark:text-teal-200/60 text-center">
            {profile?.full_name ? `مرحباً بك يا ${profile.full_name} في منصة الأحياء 🧬` : '*تابع محاضراتك يومياً لتسجيل أعلى معدل تفوق!'}
          </p>
        </div>

        {/* Left (1/3): "تقدمك" Card */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-2xl border-2 border-[#134647] dark:border-emerald-500/40 bg-white p-3 sm:p-3.5 shadow-sm dark:bg-[#091D20] flex flex-col justify-between text-center">
          <div className="absolute top-0 right-0 w-16 h-16 border-b-2 border-l-2 border-[#134647]/20 dark:border-emerald-500/25 rounded-bl-[2.5rem] pointer-events-none" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-1.5 sm:mb-2">
              معدل تقدمك
            </h3>
            <div className="text-xl sm:text-2xl font-black text-[#134647] dark:text-emerald-400 mb-1.5">
              %{stats.completed_lessons_count > 0 ? Math.min(100, stats.completed_lessons_count * 15) : 0}
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#071719] overflow-hidden mb-2.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, stats.completed_lessons_count * 15)}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-teal-200/60 leading-relaxed">
            مقياس إنجازك للمحاضرات وحل الكويزات الدورية
          </p>
        </div>
      </div>

      {/* Bottom Row: Enrolled Courses List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-2">
          الكورسات المشترك فيها
        </h3>

        {enrolledCourses.length > 0 ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {enrolledCourses.map((c: any) => (
              <div
                key={c.id || c.course_id}
                className="rounded-xl border border-slate-200/80 dark:border-teal-500/15 bg-slate-50 dark:bg-[#071719] p-2 sm:p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/teacher-circle.png"
                    alt="كورس الأحياء"
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover bg-slate-100 dark:bg-[#0D2628]"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {c.title || 'كورس الأحياء'}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-teal-200/60 mt-0.5">
                      {c.is_temporary ? 'تفعيل مؤقت ⏳' : 'اشتراك مفعل بالكامل ✅'}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/courses/${c.id || c.course_id}`}
                  prefetch={false}
                  className="w-full sm:w-auto text-center rounded-xl bg-[#134647] hover:bg-bio-teal dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3.5 py-1 text-xs font-bold shadow-sm transition active:scale-95"
                >
                  متابعة المشاهدة
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-teal-500/20 p-5 text-center text-xs text-slate-500 dark:text-teal-200/60">
            <BookOpen className="h-6 w-6 mx-auto mb-1 text-slate-400" />
            <p>أنت غير مشترك في أي كورس حالياً.</p>
            <Link
              href="/courses"
              prefetch={false}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-bio-teal hover:underline dark:text-emerald-400"
            >
              استكشف الكورسات المتاحة واشترك الآن 🚀
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
