'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Bell, User, Menu } from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';
import { NotificationsMenu, ProfileMenu, type NotificationItem } from './NavDropdowns';
import { createClient } from '@/lib/supabase/client';

interface TopNavbarProps {
  isLoggedIn?: boolean;
}

export function TopNavbar({ isLoggedIn = false }: TopNavbarProps) {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [studentName, setStudentName] = useState('طالب منصة عمار');

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn) return;

    const supabase = createClient();
    const loadUserData = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.user_metadata?.full_name) {
          setStudentName(data.user.user_metadata.full_name);
        }
      } catch {}

      try {
        const { data } = await supabase
          .from('notifications')
          .select('id, title, body, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (data && data.length > 0) {
          setNotifications(data as NotificationItem[]);
          setHasUnreadNotifications(true);
        }
      } catch {}
    };
    loadUserData();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  const isDark = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : false;

  const handleMarkAllRead = async () => {
    setHasUnreadNotifications(false);
    try {
      const supabase = createClient();
      await supabase.rpc('mark_all_notifications_read');
    } catch {}
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    setIsProfileOpen(false);
    router.push('/login');
  };

  return (
    <>
      <header ref={navRef} className="sticky top-0 z-40 w-full pt-3 sm:pt-2 px-3 sm:px-6 max-w-7xl mx-auto">
        <div className="flex h-12 sm:h-14 items-center justify-between gap-2 rounded-2xl border border-slate-200/90 bg-white/95 px-2.5 sm:px-4 shadow-sm backdrop-blur-md dark:border-teal-500/20 dark:bg-[#091D20]/95 transition-colors">
          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                aria-label="فتح القائمة الجانبية"
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl bg-bio-teal/10 hover:bg-bio-teal/20 text-bio-teal dark:bg-emerald-500/10 dark:text-emerald-400 border border-bio-teal/20 transition active:scale-95"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}

            <Link href="/" prefetch={false} className="hidden md:flex items-center shrink-0">
              <img
                src="/images/logo-ammar.png"
                alt="شعار المنصة"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex md:hidden items-center justify-center">
            <Link href="/" prefetch={false} className="flex items-center">
              <img
                src="/images/logo-ammar.png"
                alt="شعار المنصة"
                className="h-7 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              dir="ltr"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="تبديل الوضع الليلي والنهاري"
              className="relative inline-flex h-7 w-[54px] shrink-0 cursor-pointer items-center rounded-full bg-slate-200/90 p-0.5 transition-colors dark:bg-[#040D0E] dark:border dark:border-teal-500/30 focus:outline-none"
            >
              <div className="flex w-full items-center justify-between px-1.5 text-xs">
                <Sun className={`h-3 w-3 transition-colors ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
                <Moon className={`h-3 w-3 transition-colors ${isDark ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out dark:bg-emerald-500 ${
                  isDark ? 'translate-x-[26px]' : 'translate-x-0'
                }`}
              />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen((prev) => !prev);
                    setIsProfileOpen(false);
                  }}
                  aria-label="الإشعارات"
                  className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-teal-500/30 dark:bg-[#040D0E] dark:text-slate-200"
                >
                  <Bell className="h-4 w-4" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#091D20]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen((prev) => !prev);
                    setIsNotificationsOpen(false);
                  }}
                  aria-label="الملف الشخصي"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 border border-bio-teal/30 text-bio-teal hover:bg-teal-100 dark:bg-emerald-950/60 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition"
                >
                  <User className="h-4 w-4" />
                </button>

                <NotificationsMenu
                  isOpen={isNotificationsOpen}
                  hasUnread={hasUnreadNotifications}
                  onMarkAllRead={handleMarkAllRead}
                  notifications={notifications}
                />

                <ProfileMenu
                  isOpen={isProfileOpen}
                  studentName={studentName}
                  onClose={() => setIsProfileOpen(false)}
                  onLogout={handleLogout}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  prefetch={false}
                  className="flex items-center justify-center whitespace-nowrap rounded-xl border border-bio-teal/80 dark:border-emerald-500/50 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-bio-teal dark:text-emerald-300 transition hover:bg-bio-teal/10 dark:hover:bg-emerald-950/40 active:scale-95"
                >
                  تسجيل الدخول
                </Link>

                <Link
                  href="/register"
                  prefetch={false}
                  className="flex items-center justify-center whitespace-nowrap rounded-xl bg-bio-teal dark:bg-emerald-600 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-white shadow-sm transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        studentName={studentName}
      />
    </>
  );
}
