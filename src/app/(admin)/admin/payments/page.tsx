import React from 'react';
import type { Metadata } from 'next';
import { ReceiptReviewTable } from '@/features/admin/ReceiptReviewTable';
import { ActivationCodeGenerator } from '@/features/admin/ActivationCodeGenerator';

export const metadata: Metadata = {
  title: 'إدارة المدفوعات والأكواد | لوحة تحكم المنصة',
  description: 'مراجعة وتفعيل إيصالات الدفع وتوليد أكواد شحن السنتر',
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          إدارة المدفوعات، الإيصالات، وأكواد السنتر 💳
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          تفعيل إيصالات فودافون كاش وإنستا باي المعلقة، وتوليد مجموعات أكواد السنتر مع تصدير Excel
        </p>
      </div>

      <ReceiptReviewTable />
      <ActivationCodeGenerator />
    </div>
  );
}
