'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, LogOut, Menu, ExternalLink, ShieldCheck, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminUserSession } from './admin-types';

interface AdminTopNavbarProps {
  user: AdminUserSession | null;
  onlineCount: number;
  onToggleMobileMenu: () => void;
}

export function AdminTopNavbar({ user, onlineCount, onToggleMobileMenu }: AdminTopNavbarProps) {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('lms_admin_auth_user');
    router.push('/admin/login');
  };

  const isDark = mounted ? resolvedTheme === 'dark' || theme === 'dark' : false;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#071719] border-b border-slate-200/80 dark:border-teal-500/20 px-3.5 sm:px-6 py-2.5 shadow-sm transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left (RTL Start): Logo + Menu button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="القائمة الجانبية"
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-teal-500/20 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0D2628]"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link prefetch={false} href="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bio-teal text-white font-black dark:bg-emerald-600 shadow-sm">
              ع.ر
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                لوحة تحكم المنصة 🧬
              </div>
              <div className="text-[10px] text-slate-500 dark:text-teal-300/70 hidden sm:block">
                مستر عمار رزق — ثانوية عامة 2027
              </div>
            </div>
          </Link>
        </div>

        {/* Right (RTL End): Live counter + Preview Link + Dark toggle + User Profile + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Online Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <Users className="h-3.5 w-3.5" />
            <span>متصل الآن: {onlineCount}</span>
          </div>

          {/* Student Site Preview */}
          <Link
            prefetch={false}
            href="/dashboard"
            target="_blank"
            className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-bio-teal dark:text-slate-300 dark:hover:text-emerald-400 transition"
          >
            <span>شاشة الطالب</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="تبديل المظهر"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0D2628] transition"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Staff User Info */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#0D2628] text-xs font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
            <span className="truncate max-w-[120px]">{user?.fullName || 'الكادر التعليمي'}</span>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleSignOut}
            title="تسجيل الخروج"
            className="flex items-center gap-1 p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-xs font-bold"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}
