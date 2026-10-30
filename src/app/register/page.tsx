import React from 'react';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { MultiStepRegisterForm } from '@/features/auth/MultiStepRegisterForm';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'حساب جديد | منصة مستر عمار رزق للأحياء',
  description: 'انضم الآن لدفعة التفوق في مادة الأحياء مع مستر عمار رزق للثانوية العامة',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors" dir="rtl">
      <TopNavbar />
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <MultiStepRegisterForm />
      </main>
      <Footer />
    </div>
  );
}
