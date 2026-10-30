'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-teal-500/20 dark:bg-[#040D0E] text-right transition-colors" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* Column 1: Social Media (Only Facebook, Instagram, YouTube - TikTok removed) */}
          <div className="md:col-span-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-2 sm:mb-2.5">
              السوشيال ميديا
            </h4>
            <ul className="space-y-2 text-xs sm:text-xs">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  <Facebook className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>فيسبوك</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-600 hover:text-pink-600 dark:text-slate-400 dark:hover:text-pink-400 transition"
                >
                  <Instagram className="h-3.5 w-3.5 text-pink-600 shrink-0" />
                  <span>انستجرام</span>
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition"
                >
                  <Youtube className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  <span>يوتيوب</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Pages */}
          <div className="md:col-span-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-2 sm:mb-2.5">
              الصفحات
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/" prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400 transition">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/help" prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400 transition">
                  المساعدة
                </Link>
              </li>
              <li>
                <Link href="/register" prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400 transition">
                  انشاء حساب جديد
                </Link>
              </li>
              <li>
                <Link href="/login" prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400 transition">
                  تسجيل الدخول
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Logo, Professional Copyright & Developer Badge */}
          <div className="md:col-span-6 flex flex-col items-start md:items-end text-right md:text-left">
            <img
              src="/images/logo-ammar.png"
              alt="شعار المنصة"
              className="h-7 sm:h-8 w-auto object-contain mb-2"
            />
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                <span>جميع الحقوق محفوظة © {new Date().getFullYear()} لمنصة الأستاذ عمار رزق</span>
              </div>

              {/* Ultra Clean Developer Credit Badge */}
              <div
                className="inline-flex flex-wrap max-w-full items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] px-2 sm:px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 shadow-sm"
                dir="ltr"
              >
                <span>{'<Developed by="'}</span>
                <span className="font-bold text-[#134647] dark:text-[#34D399]">Abdallah Rizk</span>
                <span>{'" andPowered=true />'}</span>
              </div>

              <div>
                <Link
                  href="/terms"
                  prefetch={false}
                  className="text-[11px] font-medium text-rose-500 hover:text-rose-600 hover:underline transition"
                >
                  Terms and Condition
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
