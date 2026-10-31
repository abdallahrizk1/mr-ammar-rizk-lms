import React from 'react';
import type { Metadata } from 'next';
import { StudentManager } from '@/features/admin/StudentManager';

export const metadata: Metadata = {
  title: 'إدارة الطلاب ومتابعة ولي الأمر | لوحة تحكم المنصة',
  description: 'البحث الفوري عن الطلاب، تغيير كلمات السر، تقرير واتساب، وتصدير كشوفات الإكسيل',
};

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          إدارة شؤون الطلاب ومتابعة أولياء الأمور 👨‍🎓
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          بحث سريع بالاسم ورقم الهاتف، توثيق الحسابات، إعادة تعيين كلمات السر، وإرسال تقارير المتابعة عبر واتساب
        </p>
      </div>

      <StudentManager />
    </div>
  );
}
