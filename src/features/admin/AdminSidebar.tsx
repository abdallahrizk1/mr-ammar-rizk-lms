'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_ITEMS, canAccessNavItem } from './admin-nav';
import type { AdminUserSession } from './admin-types';

interface AdminSidebarProps {
  user: AdminUserSession | null;
  className?: string;
  onItemClick?: () => void;
}

export function AdminSidebar({ user, className = '', onItemClick }: AdminSidebarProps) {
  const pathname = usePathname();

  const accessibleItems = ADMIN_NAV_ITEMS.filter((item) => canAccessNavItem(item, user));

  return (
    <aside
      className={`w-64 bg-white dark:bg-[#091D20] border border-slate-200/80 dark:border-teal-500/20 p-3.5 flex flex-col justify-between transition-colors ${className}`}
      dir="rtl"
    >
      <div className="space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-teal-300/60 uppercase tracking-wider">
          أقسام الإدارة والتحكم
        </div>

        {accessibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={onItemClick}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                isActive
                  ? 'bg-bio-teal text-white shadow-sm dark:bg-emerald-600'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#071719] dark:hover:text-emerald-300'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-teal-500/20 px-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-teal-300/70">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>الرتبة: {user?.role === 'super_admin' ? 'مستر عمار رزق 👑' : user?.role === 'assistant' ? 'مساعد معتمد 🛡️' : 'مدير نظام ⚙️'}</span>
        </div>
      </div>
    </aside>
  );
}
