'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  MessageSquare,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalStudents: number;
  pendingReceipts: number;
  unansweredForum: number;
  totalCourses: number;
}

export function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    pendingReceipts: 0,
    unansweredForum: 0,
    totalCourses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [onlineCount, setOnlineCount] = useState(1);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const [studentsRes, receiptsRes, forumRes, coursesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('payment_receipts').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
        supabase.from('forum_questions').select('id', { count: 'exact', head: true }).is('reply_text', null).eq('status', 'pending'),
        supabase.from('courses').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        pendingReceipts: receiptsRes.count || 0,
        unansweredForum: forumRes.count || 0,
        totalCourses: coursesRes.count || 0,
      });
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    try {
      const supabase = createClient();
      const channel = supabase.channel('platform_presence');
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setOnlineCount(Math.max(1, Object.keys(state).length));
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } catch {}
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              مرحباً بك في لوحة تحكم المنصة 🧬
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>متصلون الآن: {onlineCount}</span>
            </span>
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
            نظرة عامة على نشاط المنصة، الطلاب، المدفوعات والأسئلة
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#091D20] dark:hover:bg-[#0c272a] text-xs font-bold text-slate-700 dark:text-emerald-300 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث الإحصائيات</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-teal-200/70">إجمالي الطلاب المسجلين</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : stats.totalStudents}
            </span>
            <span className="text-xs font-semibold text-slate-400">طالب</span>
          </div>
          <Link prefetch={false} href="/admin/students" className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline dark:text-blue-400">
            <span>إدارة شؤون الطلاب</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Pending Receipts */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 shadow-sm dark:border-amber-500/25 dark:bg-[#091D20]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">إيصالات بانتظار المراجعة</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {isLoading ? '...' : stats.pendingReceipts}
            </span>
            <span className="text-xs font-semibold text-amber-600/70">إيصال معلق</span>
          </div>
          <Link prefetch={false} href="/admin/payments" className="mt-3 flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline dark:text-amber-400">
            <span>مراجعة وتفعيل الإيصالات</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Unanswered Forum */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 shadow-sm dark:border-rose-500/25 dark:bg-[#091D20]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">أسئلة منتدى غير مجابة</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
              {isLoading ? '...' : stats.unansweredForum}
            </span>
            <span className="text-xs font-semibold text-rose-600/70">سؤال معلق</span>
          </div>
          <Link prefetch={false} href="/admin/forum" className="mt-3 flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline dark:text-rose-400">
            <span>الرد صوتياً أو كتابياً</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Total Courses */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-teal-200/70">الكورسات المتاحة</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {isLoading ? '...' : stats.totalCourses}
            </span>
            <span className="text-xs font-semibold text-slate-400">كورس</span>
          </div>
          <Link prefetch={false} href="/admin/courses" className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline dark:text-emerald-400">
            <span>باني الكورسات والمحاضرات</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Quick Launchpad Grid */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          ⚡ وصول سريع لأهم الأدوات
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link prefetch={false} href="/admin/courses" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-teal-500/10 bg-slate-50 dark:bg-[#071719] hover:bg-teal-50 dark:hover:bg-teal-950/30 transition text-center group">
            <BookOpen className="h-6 w-6 text-bio-teal dark:text-emerald-400 group-hover:scale-110 transition" />
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">إضافة كورس ومحاضرة</span>
          </Link>
          <Link prefetch={false} href="/admin/exams" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-teal-500/10 bg-slate-50 dark:bg-[#071719] hover:bg-teal-50 dark:hover:bg-teal-950/30 transition text-center group">
            <FileCheck2 className="h-6 w-6 text-indigo-500 group-hover:scale-110 transition" />
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">بناء كويز سريع بالصور</span>
          </Link>
          <Link prefetch={false} href="/admin/payments" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-teal-500/10 bg-slate-50 dark:bg-[#071719] hover:bg-teal-50 dark:hover:bg-teal-950/30 transition text-center group">
            <CreditCard className="h-6 w-6 text-amber-500 group-hover:scale-110 transition" />
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">توليد أكواد السنتر</span>
          </Link>
          <Link prefetch={false} href="/admin/forum" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-teal-500/10 bg-slate-50 dark:bg-[#071719] hover:bg-teal-50 dark:hover:bg-teal-950/30 transition text-center group">
            <MessageSquare className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition" />
            <span className="mt-2 text-xs font-bold text-slate-800 dark:text-slate-200">الردود الصوتية للطلاب</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
