import React from 'react';
import type { Metadata } from 'next';
import { AdminForumManager } from '@/features/admin/AdminForumManager';

export const metadata: Metadata = {
  title: 'إدارة المنتدى والرد الصوتي | لوحة تحكم المنصة',
  description: 'الرد على أسئلة الطلاب بنصوص وريكوردات صوتية ونشرها في المنتدى العام',
};

export default function AdminForumPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          إدارة منتدى الأسئلة والردود الصوتية 🎙️
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          متابعة أسئلة واستفسارات الطلاب، تسجيل ريكوردات الشرح الصوتي، والنشر في المنتدى العام
        </p>
      </div>

      <AdminForumManager />
    </div>
  );
}
