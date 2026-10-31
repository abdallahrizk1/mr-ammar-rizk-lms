'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminTopNavbar } from '@/features/admin/AdminTopNavbar';
import { AdminSidebar } from '@/features/admin/AdminSidebar';
import type { AdminUserSession } from '@/features/admin/admin-types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If on admin login page, don't show admin shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Fast-path: immediate optimistic restore from localStorage prevents UI stall
    try {
      const cached = localStorage.getItem('lms_admin_auth_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.role && ['super_admin', 'admin', 'assistant'].includes(parsed.role)) {
          setUser(parsed);
          setIsLoading(false);
        }
      }
    } catch {
      // Fallback to async check
    }

    const checkAuth = async () => {
      try {
        const supabase = createClient();
        // 4s timeout prevents indefinite loading stall if Supabase client is slow
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 4000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        if (!isMounted) return;

        if (!session?.user) {
          const cached = localStorage.getItem('lms_admin_auth_user');
          if (!cached) {
            router.push('/admin/login');
            return;
          }
          const parsed = JSON.parse(cached);
          if (!['super_admin', 'admin', 'assistant'].includes(parsed?.role)) {
            router.push('/admin/login');
            return;
          }
          setUser(parsed);
          return;
        }

        const role = session.user.app_metadata?.role || session.user.user_metadata?.role;
        if (!['super_admin', 'admin', 'assistant'].includes(role)) {
          localStorage.removeItem('lms_admin_auth_user');
          router.push('/admin/login');
          return;
        }

        const adminSession: AdminUserSession = {
          id: session.user.id,
          fullName: session.user.user_metadata?.full_name || 'الكادر التعليمي',
          phone: session.user.app_metadata?.phone || session.user.user_metadata?.phone || '',
          role,
          permissions: session.user.app_metadata?.permissions || {},
        };

        setUser(adminSession);
        localStorage.setItem('lms_admin_auth_user', JSON.stringify(adminSession));
      } catch {
        const cached = localStorage.getItem('lms_admin_auth_user');
        if (!cached) {
          router.push('/admin/login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, isLoginPage]);

  // Realtime Presence for Live Online Students Counter
  useEffect(() => {
    if (isLoginPage) return;

    try {
      const supabase = createClient();
      const channel = supabase.channel('platform_presence', {
        config: { presence: { key: user?.id || 'admin_user' } },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          setOnlineCount(Math.max(1, count));
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString(), role: user?.role || 'staff' });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Fallback
    }
  }, [isLoginPage, user?.id, user?.role]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#040D0E]" dir="rtl">
        <div className="flex flex-col items-center gap-3 text-sm font-bold text-slate-700 dark:text-emerald-300">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-bio-teal border-t-transparent" />
          <span>جارٍ التحقق من صلاحيات لوحة التحكم...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#040D0E] text-slate-900 dark:text-slate-100 transition-colors" dir="rtl">
      <AdminTopNavbar
        user={user}
        onlineCount={onlineCount}
        onToggleMobileMenu={() => setIsMobileMenuOpen((o) => !o)}
      />

      <div className="flex flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 mt-3 sm:mt-4 mb-8 gap-4 sm:gap-6">
        {/* Desktop Sidebar */}
        <AdminSidebar
          user={user}
          className="hidden md:flex rounded-2xl shadow-sm h-[calc(100vh-90px)] sticky top-20 shrink-0"
        />

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex" dir="rtl">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] h-full z-10 bg-white dark:bg-[#091D20] shadow-2xl flex flex-col">
              <AdminSidebar
                user={user}
                className="w-full h-full border-0"
                onItemClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
