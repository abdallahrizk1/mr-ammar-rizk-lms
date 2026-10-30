'use client';

import React from 'react';
import Link from 'next/link';
import { Home, LayoutDashboard, Shield, LogOut, CheckCheck } from 'lucide-react';

export const INITIAL_NOTIFICATIONS = [
  { id: 'n1', title: 'تم إضافة واجب جديد على درس الدعامة في الإنسان', time: 'منذ ساعتين' },
  { id: 'n2', title: 'اختبار تجريبي متاح الآن لمدة 48 ساعة', time: 'منذ يوم' },
  { id: 'n3', title: 'مرحباً بك في منصة مستر عمار رزق للأحياء!', time: 'منذ يومين' },
];

interface NotificationsMenuProps {
  isOpen: boolean;
  hasUnread: boolean;
  onMarkAllRead: () => void;
}

export function NotificationsMenu({ isOpen, hasUnread, onMarkAllRead }: NotificationsMenuProps) {
  if (!isOpen) return null;

  return (
    <div dir="rtl" className="absolute left-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-900 dark:text-white">الإشعارات التعليمية</span>
        {hasUnread && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-bio-teal hover:underline dark:text-emerald-400"
          >
            <CheckCheck className="h-3 w-3" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </div>
      <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
        {INITIAL_NOTIFICATIONS.map((n) => (
          <div key={n.id} className="rounded-xl bg-slate-50 p-2.5 text-right transition hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
            <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProfileMenuProps {
  isOpen: boolean;
  studentName: string;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileMenu({ isOpen, studentName, onClose, onLogout }: ProfileMenuProps) {
  if (!isOpen) return null;

  return (
    <div dir="rtl" className="absolute left-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2">
      <div className="border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <p className="text-xs text-slate-400">مرحباً بك،</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">أهلاً يا {studentName} 🎓</p>
      </div>

      <div className="py-2 space-y-1">
        <Link
          href="/"
          prefetch={false}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Home className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
          <span>الرئيسية</span>
        </Link>
        <Link
          href="/dashboard"
          prefetch={false}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <LayoutDashboard className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
          <span>لوحة التحكم</span>
        </Link>
        <Link
          href="/account"
          prefetch={false}
          onClick={onClose}
          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Shield className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
          <span>حسابي وإعدادات الأمان</span>
        </Link>
      </div>

      <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
