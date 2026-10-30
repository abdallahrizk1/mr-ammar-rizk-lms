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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors" dir="rtl">
      {/* 1. Top Navbar after login (Matching Image 5: Bell + Profile + Mobile Menu) */}
      <TopNavbar isLoggedIn={true} />

      {/* 2. Main Layout with Right Sidebar and Left Content */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 mt-4 sm:mt-6 mb-10 gap-4 sm:gap-6">
        {/* Right Sidebar (Desktop & Laptop) */}
        <CollapsibleSidebar className="hidden md:flex rounded-2xl shadow-sm h-[calc(100vh-140px)] sticky top-24 shrink-0" />

        {/* Left Content Area (min-w-0 prevents flexbox horizontal blowout) */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
