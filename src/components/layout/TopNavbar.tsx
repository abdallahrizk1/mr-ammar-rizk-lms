'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Bell, User } from 'lucide-react';

interface TopNavbarProps {
  isLoggedIn?: boolean;
}

export function TopNavbar({ isLoggedIn = false }: TopNavbarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : false;

  return (
    <header className="sticky top-0 z-40 w-full pt-2.5 sm:pt-3 px-3 sm:px-6 max-w-7xl mx-auto">
      <div className="flex h-14 sm:h-16 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 px-3.5 sm:px-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
        
        {/* Left Side: Brand Logo + Safe Isolated LTR Capsule Switch */}
        <div className="flex items-center gap-3">
          <Link href="/" prefetch={false} className="flex items-center">
            <img
              src="/images/logo-ammar.png"
              alt="شعار المنصة"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* Capsule Theme Toggle Switch (Forced LTR to prevent RTL knob overflow) */}
          <button
            type="button"
            dir="ltr"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="تبديل المظهر النهاري والليلي"
            className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center justify-between rounded-full bg-slate-800 dark:bg-slate-700 p-1 transition-colors focus:outline-none shadow-inner"
          >
            <Sun className="h-3.5 w-3.5 text-amber-300 ml-0.5 pointer-events-none" />
            <Moon className="h-3.5 w-3.5 text-slate-300 mr-0.5 pointer-events-none" />
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${
                isDark ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Center: Blank */}
        <div className="flex-1" />

        {/* Right Side: Auth Buttons OR Bell + Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="الإشعارات"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              </button>

              <button
                type="button"
                aria-label="الملف الشخصي"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 border border-bio-teal/30 text-bio-teal dark:bg-teal-950 dark:text-teal-300"
              >
                <User className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                prefetch={false}
                className="flex items-center justify-center rounded-xl border-2 border-bio-teal px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-bio-teal transition hover:bg-bio-teal/10 active:scale-95"
              >
                تسجيل الدخول
              </Link>

              <Link
                href="/register"
                prefetch={false}
                className="flex items-center justify-center rounded-xl bg-bio-teal px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-bio-deep active:scale-95"
              >
                حساب جديد
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
