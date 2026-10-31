import React from 'react';
import type { Metadata } from 'next';
import { StaffManager } from '@/features/admin/StaffManager';

export const metadata: Metadata = {
  title: 'إدارة المساعدين والصلاحيات | لوحة تحكم المنصة',
  description: 'إضافة وتعديل حسابات المساعدين والصلاحيات التفصيلية',
};

export default function AdminStaffPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          إدارة حسابات المساعدين والكادر الإداري 🛡️
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          إضافة حسابات المساعدين وتخصيص صلاحيات كل مساعد للتحكم بالكورسات أو الامتحانات أو المدفوعات
        </p>
      </div>

      <StaffManager />
    </div>
  );
}
