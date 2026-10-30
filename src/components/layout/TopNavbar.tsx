'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Bell, User, Menu } from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';
import { NotificationsMenu, ProfileMenu } from './NavDropdowns';

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
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [studentName, setStudentName] = useState('طالب منصة عمار');

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem('lms_notifications_read') === 'true') {
      setHasUnreadNotifications(false);
    }
    const userStr = localStorage.getItem('lms_preview_auth_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.fullName) setStudentName(u.fullName);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : false;

  const handleMarkAllRead = () => {
    setHasUnreadNotifications(false);
    localStorage.setItem('lms_notifications_read', 'true');
  };

  const handleLogout = () => {
    localStorage.removeItem('lms_preview_auth_user');
    setIsProfileOpen(false);
    router.push('/login');
  };

  return (
    <>
      <header ref={navRef} className="sticky top-0 z-40 w-full pt-2.5 sm:pt-3 px-3 sm:px-6 max-w-7xl mx-auto">
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
              aria-label="تبديل الوضع الليلي والنهاري"
              className="relative inline-flex h-8 w-15 items-center rounded-full bg-slate-200/90 p-1 transition-colors dark:bg-slate-800 focus:outline-none"
            >
              <div className="flex w-full items-center justify-between px-1.5 text-xs">
                <Sun className={`h-3.5 w-3.5 transition-colors ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
                <Moon className={`h-3.5 w-3.5 transition-colors ${isDark ? 'text-teal-400' : 'text-slate-400'}`} />
              </div>
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out dark:bg-bio-teal ${
                  isDark ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Right Side: Logged-in controls OR Auth buttons */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 relative">
                {/* Mobile Drawer Trigger (md:hidden) */}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(true)}
                  aria-label="فتح القائمة الجانبية"
                  className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* Notification Bell with Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen((prev) => !prev);
                      setIsProfileOpen(false);
                    }}
                    aria-label="الإشعارات"
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Bell className="h-4 w-4" />
                    {hasUnreadNotifications && (
                      <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>

                  <NotificationsMenu
                    isOpen={isNotificationsOpen}
                    hasUnread={hasUnreadNotifications}
                    onMarkAllRead={handleMarkAllRead}
                  />
                </div>

                {/* Profile Icon with Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen((prev) => !prev);
                      setIsNotificationsOpen(false);
                    }}
                    aria-label="الملف الشخصي"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 border border-bio-teal/30 text-bio-teal hover:bg-teal-100 dark:bg-teal-950 dark:text-teal-300 dark:hover:bg-teal-900 transition"
                  >
                    <User className="h-4 w-4" />
                  </button>

                  <ProfileMenu
                    isOpen={isProfileOpen}
                    studentName={studentName}
                    onClose={() => setIsProfileOpen(false)}
                    onLogout={handleLogout}
                  />
                </div>
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

      {/* Mobile Drawer (visible when opened on mobile) */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        studentName={studentName}
      />
    </>
  );
}
