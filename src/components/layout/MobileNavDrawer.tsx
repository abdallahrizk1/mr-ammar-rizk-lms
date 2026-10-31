'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, BookOpen, Users, User, LogOut, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutGrid },
  { href: '/courses', label: 'الكورسات', icon: BookOpen },
  { href: '/forum', label: 'المنتدى', icon: Users },
  { href: '/account', label: 'حسابي', icon: User },
];

export function MobileNavDrawer({ isOpen, onClose, studentName }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    onClose();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden" dir="rtl">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer */}
      <aside className="fixed inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col justify-between border-l border-slate-200 bg-white p-4 sm:p-5 shadow-2xl dark:border-teal-500/20 dark:bg-[#091D20] transition-transform">
        <div>
          {/* Header with Logo and Close Button */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-teal-500/20">
            <div className="flex items-center gap-2">
              <img
                src="/images/logo-ammar.png"
                alt="شعار المنصة"
                className="h-7 w-auto object-contain"
              />
              <span className="text-xs font-bold text-bio-teal dark:text-emerald-400">
                منصة الأحياء
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق القائمة"
              className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#0D2628] dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Student Welcome Greeting */}
          {studentName && (
            <div className="my-3 rounded-xl bg-bio-teal/10 p-2.5 text-xs font-bold text-bio-teal dark:bg-emerald-950/60 dark:border dark:border-emerald-500/20 dark:text-emerald-300">
              أهلاً بك، {studentName} 🎓
            </div>
          )}

          {/* 4 Main Nav Items */}
          <nav className="mt-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-xl p-2.5 text-xs sm:text-sm font-bold transition ${
                    isActive
                      ? 'bg-bio-teal text-white shadow-sm dark:bg-emerald-600'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#0D2628]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="border-t border-slate-100 pt-3 dark:border-teal-500/20">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
