import React from 'react';
import type { Metadata } from 'next';
import { NotificationSender } from '@/features/admin/NotificationSender';

export const metadata: Metadata = {
  title: 'إرسال الإشعارات والتنبيهات | لوحة تحكم المنصة',
  description: 'بث التنبيهات المباشرة لجميع الطلاب أو لصف دراسي أو كورس معين',
};

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          بث الإشعارات والتنبيهات التعليمية 📢
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          إرسال إشعارات فورية تظهر في جرس إشعارات الطلاب المستهدفين فور دخولهم
        </p>
      </div>

      <NotificationSender />
    </div>
  );
}
