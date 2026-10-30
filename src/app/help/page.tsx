import React from 'react';
import Link from 'next/link';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { Footer } from '@/components/landing/Footer';
import { HelpCircle, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'المساعدة والدعم الفني | منصة مستر عمار رزق للأحياء',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-[#040D0E] text-slate-900 dark:text-slate-100 transition-colors" dir="rtl">
      <TopNavbar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-teal-500/20 dark:bg-[#0D2628] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-500/20 pb-3">
            <h1 className="text-base sm:text-lg font-black text-bio-teal dark:text-emerald-400 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <span>مركز المساعدة والدعم الفني</span>
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

          <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <div className="rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
              <h2 className="font-bold text-slate-900 dark:text-emerald-300 mb-1">1. كيف أشترك في الكورسات؟</h2>
              <p>أنشئ حساباً جديداً برقم هاتفك ورقم ولي الأمر، ثم اختر الكورس المناسب لصفك الدراسي وفعل اشتراكك عبر كود التفعيل أو محفظة فودافون كاش / انستا باي.</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
              <h2 className="font-bold text-slate-900 dark:text-emerald-300 mb-1">2. نسيت كلمة السر الخاصة بحسابي؟</h2>
              <p>تواصل مع فريق الدعم الفني عبر واتساب وسيقوم المشرف بالتحقق من رقم الهاتف المسجل وإعادة تعيين كلمة السر لك فوراً.</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#071719] p-3 border border-slate-200/70 dark:border-teal-500/15">
              <h2 className="font-bold text-slate-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>3. تشغيل الفيديوهات على الآيفون والأندرويد</span>
              </h2>
              <p>تعمل جميع المحاضرات بجودة عالية على متصفحات Safari و Chrome على جميع الهواتف والأجهزة اللوحية والكمبيوتر.</p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>تواصل مباشر مع الدعم الفني عبر واتساب</span>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
