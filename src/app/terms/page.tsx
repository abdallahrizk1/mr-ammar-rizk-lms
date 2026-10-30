import React from 'react';
import Link from 'next/link';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Footer } from '@/components/landing/Footer';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'الشروط والأحكام | منصة مستر عمار رزق للأحياء',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-[#040D0E] text-slate-900 dark:text-slate-100 transition-colors" dir="rtl">
      <TopNavbar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-teal-500/20 dark:bg-[#0D2628] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-500/20 pb-3">
            <h1 className="text-base sm:text-lg font-black text-bio-teal dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span>الشروط والأحكام (Terms & Conditions)</span>
            </h1>
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-bio-teal dark:text-slate-300 dark:hover:text-emerald-400"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>الرئيسية</span>
            </Link>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed list-disc pr-4">
            <li>الحساب شخصي لكل طالب ويُمنع مشاركة بيانات الدخول مع أكثر من طالب.</li>
            <li>يجب إدخال رقم هاتف الطالب ورقم هاتف ولي الأمر بشكل صحيح لضمان المتابعة الدورية للدرجات والغياب.</li>
            <li>جميع الفيديوهات والمذكرات والاختبارات محمية بحقوق الملكية الفكرية لمنصة الأستاذ عمار رزق.</li>
            <li>يحق لإدارة المنصة مراجعة بيانات الحسابات الجديدة خلال 24 إلى 48 ساعة من التسجيل.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
