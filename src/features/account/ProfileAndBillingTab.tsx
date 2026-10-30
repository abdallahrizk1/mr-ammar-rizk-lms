'use client';

import React, { useState } from 'react';
import { PlayCircle, Award, Receipt, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  StudentStats,
  EnrolledCourseItem,
  InvoiceItem,
} from '@/lib/data/student-profile-data';
import { PaginationControls } from '@/components/ui/PaginationControls';

interface ProfileAndBillingTabProps {
  stats: StudentStats;
  enrolledCourses: EnrolledCourseItem[];
  invoices: InvoiceItem[];
}

const PAGE_SIZE = 10;

export function ProfileAndBillingTab({
  stats,
  enrolledCourses,
  invoices,
}: ProfileAndBillingTabProps) {
  const [invoicePage, setInvoicePage] = useState(1);

  const videoPercent = Math.round((stats.videosWatched / stats.totalVideos) * 100);
  const quizPercent = Math.round((stats.quizzesPassed / stats.quizzesTaken) * 100);

  const startIdx = (invoicePage - 1) * PAGE_SIZE;
  const paginatedInvoices = invoices.slice(startIdx, startIdx + PAGE_SIZE);

  return (
    <div className="space-y-4" dir="rtl">
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              إحصائيات مشاهدة الفيديوهات
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-bio-teal/10 dark:bg-emerald-500/10 text-bio-teal dark:text-emerald-400">
              <PlayCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {stats.videosWatched} <span className="text-xs font-normal text-slate-400">من {stats.totalVideos} محاضرة</span>
            </div>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              {videoPercent}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-[#071719] overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${videoPercent}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              إحصائيات الاختبارات والاجتياز
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {stats.quizzesPassed} <span className="text-xs font-normal text-slate-400">اجتياز من {stats.quizzesTaken} اختبار</span>
            </div>
            <span className="text-xs font-black text-amber-500">
              {quizPercent}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-[#071719] overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${quizPercent}%` }} />
          </div>
        </div>
      </div>

      {/* 2. Enrolled Courses */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
          <span>كورساتي المشترك بها</span>
          <span className="rounded-full bg-slate-100 dark:bg-[#071719] px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-teal-300">
            {enrolledCourses.length}
          </span>
        </h2>

        <div className="space-y-2.5">
          {enrolledCourses.map((c) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 dark:border-teal-500/15 bg-slate-50 dark:bg-[#071719] p-3"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {c.title}
                  </h3>
                  {c.status === 'temporary' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-3 w-3" />
                      تفعيل مؤقت قيد المراجعة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      مفعل نهائياً
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 dark:text-teal-300/60">
                  <span>{c.grade}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    انتهاء الصلاحية: {c.expiresAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  إنجاز {c.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Invoices & Payment History Table (Paginated 10 per page + Mobile Cards) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
            <span>الفواتير وسجل المدفوعات</span>
          </h2>
          <span className="rounded-full bg-slate-100 dark:bg-[#071719] px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:text-teal-300">
            {invoices.length} فاتورة
          </span>
        </div>

        {/* Mobile Cards (< md) */}
        <div className="md:hidden space-y-2.5">
          {paginatedInvoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl border border-slate-200/80 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-teal-300" dir="ltr">
                  {inv.id}
                </span>
                <span className="text-xs font-black text-bio-teal dark:text-emerald-400">
                  {inv.amount}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {inv.courseTitle}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-teal-300/70 border-t border-slate-200/60 dark:border-teal-500/10 pt-2">
                <span>{inv.method} • {inv.date}</span>
                {inv.status === 'مفعل نهائياً' ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    مفعل نهائياً
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                    قيد المراجعة
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-teal-500/20 text-slate-400 dark:text-teal-300/60 text-[11px]">
                <th className="py-2 px-2.5 font-bold">رقم العملية</th>
                <th className="py-2 px-2.5 font-bold">اسم الكورس / البند</th>
                <th className="py-2 px-2.5 font-bold">المبلغ</th>
                <th className="py-2 px-2.5 font-bold">طريقة الدفع</th>
                <th className="py-2 px-2.5 font-bold">التاريخ</th>
                <th className="py-2 px-2.5 font-bold">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10">
              {paginatedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-[#071719] transition">
                  <td className="py-2.5 px-2.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300" dir="ltr">
                    {inv.id}
                  </td>
                  <td className="py-2.5 px-2.5 font-semibold text-slate-900 dark:text-white">
                    {inv.courseTitle}
                  </td>
                  <td className="py-2.5 px-2.5 font-bold text-bio-teal dark:text-emerald-400">
                    {inv.amount}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-600 dark:text-slate-300">
                    {inv.method}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-500 dark:text-teal-300/60 text-[11px]">
                    {inv.date}
                  </td>
                  <td className="py-2.5 px-2.5">
                    {inv.status === 'مفعل نهائياً' ? (
                      <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        مفعل نهائياً
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        قيد المراجعة
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={invoicePage}
          totalItems={invoices.length}
          pageSize={PAGE_SIZE}
          onPageChange={setInvoicePage}
          itemLabel="فاتورة"
        />
      </div>
    </div>
  );
}
