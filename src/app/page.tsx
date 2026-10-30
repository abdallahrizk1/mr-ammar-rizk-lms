import React from 'react';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { WhyJoinUsSection } from '@/components/landing/WhyJoinUsSection';
import { AvailableCoursesSection } from '@/components/landing/AvailableCoursesSection';
import { Footer } from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* 1. Top Navbar (Matching Image 1 & Image 5) */}
      <TopNavbar />

      <main className="flex-1 mt-4 sm:mt-6">
        {/* 2. Hero Section (Matching Image 1) */}
        <HeroSection />

        {/* 3. Why Join Us Section (Matching Image 2) */}
        <WhyJoinUsSection />

        {/* 4. Available Courses (Matching Image 3) */}
        <AvailableCoursesSection />
      </main>

      {/* 5. Footer (Matching Image 4) */}
      <Footer />
    </div>
  );
}
