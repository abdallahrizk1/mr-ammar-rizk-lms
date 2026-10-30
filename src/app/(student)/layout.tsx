'use client';

import React from 'react';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { CollapsibleSidebar } from '@/components/layout/CollapsibleSidebar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#040D0E] text-slate-900 dark:text-slate-100 transition-colors" dir="rtl">
      {/* 1. Top Navbar after login (Matching Image 5: Bell + Profile + Mobile Menu) */}
      <TopNavbar isLoggedIn={true} />

      {/* 2. Main Layout with Right Sidebar and Left Content */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 mt-2.5 sm:mt-3 mb-6 gap-3 sm:gap-4">
        {/* Right Sidebar (Desktop & Laptop) */}
        <CollapsibleSidebar className="hidden md:flex rounded-2xl shadow-sm h-[calc(100vh-80px)] sticky top-16 shrink-0" />

        {/* Left Content Area (min-w-0 prevents flexbox horizontal blowout) */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
