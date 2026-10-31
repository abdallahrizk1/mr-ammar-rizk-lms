import React from 'react';
import type { Metadata } from 'next';
import { PlatformSettingsManager } from '@/features/admin/PlatformSettingsManager';

export const metadata: Metadata = {
  title: 'إعدادات المنصة وطرق الدفع | لوحة تحكم المنصة',
  description: 'تعديل محافظ فودافون كاش وإنستا باي ورقم واتساب الدعم',
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          إعدادات المنصة وطرق الدفع ⚙️
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          تعديل أرقام فودافون كاش، حساب إنستا باي، ورقم واتساب الدعم الفني دون لمس الكود
        </p>
      </div>

      <PlatformSettingsManager />
    </div>
  );
}
