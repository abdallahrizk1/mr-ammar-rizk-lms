'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  BookOpen,
  Users,
  User,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface CollapsibleSidebarProps {
  className?: string;
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutGrid },
  { href: '/courses', label: 'الكورسات', icon: BookOpen },
  { href: '/forum', label: 'المنتدى', icon: Users },
  { href: '/account', label: 'حسابي', icon: User },
];

export function CollapsibleSidebar({ className = '', onLogout }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      dir="rtl"
      className={`flex flex-col justify-between border-l border-slate-200 bg-white p-4 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      <div>
        {/* Toggle Collapse Button (Top Right in Image 5) */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl p-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition mb-6"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#10B981] text-white">
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </div>
          {!isCollapsed && <span>تصغير النافذة</span>}
        </button>

        {/* 4 Main Nav Items (Image 5) */}
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                title={item.label}
                className={`flex items-center gap-3 rounded-xl p-3 text-sm font-bold transition ${
                  isActive
                    ? 'bg-[#10B981] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button (Bottom Red in Image 5) */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 p-3 text-xs sm:text-sm font-bold text-white shadow-sm transition active:scale-95"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
