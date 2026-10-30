import React from 'react';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { LoginForm } from '@/features/auth/LoginForm';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'تسجيل الدخول | منصة مستر عمار رزق للأحياء',
  description: 'سجل دخولك الآن لمتابعة دروس ومراجعات مادة الأحياء مع مستر عمار رزق للثانوية العامة',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors" dir="rtl">
      <TopNavbar />
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}
