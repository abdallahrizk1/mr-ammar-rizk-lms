import React from 'react';
import type { Metadata } from 'next';
import { AdminLoginForm } from '@/features/admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'تسجيل دخول الكادر التعليمي | منصة مستر عمار رزق',
  description: 'بوابة تسجيل دخول المدرس والمساعدين لإدارة منصة الأحياء التعليمية',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 dark:bg-[#040D0E] transition-colors">
      <AdminLoginForm />
    </div>
  );
}
