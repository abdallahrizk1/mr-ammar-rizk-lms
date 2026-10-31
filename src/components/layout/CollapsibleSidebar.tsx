'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  BookOpen,
  Users,
  User,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

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
  const router = useRouter();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}
      router.push('/login');
    }
  };

  return (
    <aside
      dir="rtl"
      className={`flex flex-col justify-between border-l border-slate-200 bg-white p-3 transition-all duration-300 dark:border-teal-500/20 dark:bg-[#091D20] ${
        isCollapsed ? 'w-16' : 'w-56 lg:w-60'
      } ${className}`}
    >
      <div>
        {/* Toggle Collapse Button (Top Right in Image 5) */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl p-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#0D2628] transition mb-4"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#10B981] text-white">
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </div>
          {!isCollapsed && <span className="text-xs">تصغير النافذة</span>}
        </button>

        {/* 4 Main Nav Items (Image 5) */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                title={item.label}
                className={`flex items-center gap-2.5 rounded-xl p-2.5 text-xs sm:text-sm font-bold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#0D2628]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button (Bottom Red in Image 5) */}
      <div className="pt-3 border-t border-slate-100 dark:border-teal-500/20">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 p-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}
