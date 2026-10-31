import React from 'react';
import type { Metadata } from 'next';
import { AuditLogsAndTrashBin } from '@/features/admin/AuditLogsAndTrashBin';

export const metadata: Metadata = {
  title: 'سجل المراقبة وسلة المحذوفات | لوحة تحكم المنصة',
  description: 'متابعة سجل عمليات المساعدين وسلة المحذوفات للاسترجاع السريع',
};

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          سجل المراقبة وسلة المحذوفات 🕵️‍♂️
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          تتبع كل عملية قام بها المساعدون بالتاريخ والتفاصيل، مع استرجاع الكورسات أو المحاضرات المحذوفة بضغطة زر
        </p>
      </div>

      <AuditLogsAndTrashBin />
    </div>
  );
}
