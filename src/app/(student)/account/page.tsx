'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Shield,
  Award,
  BookOpen,
  Video,
  AlertCircle,
} from 'lucide-react';
import { AccountTabId } from '@/features/account/account-types';
import { StudentProfileCard } from '@/features/account/StudentProfileCard';
import { ProfileAndBillingTab } from '@/features/account/ProfileAndBillingTab';
import { SecurityAndSessionsTab } from '@/features/account/SecurityAndSessionsTab';
import { QuizResultsTab } from '@/features/account/QuizResultsTab';
import { HomeworkResultsTab } from '@/features/account/HomeworkResultsTab';
import { WatchHistoryTab } from '@/features/account/WatchHistoryTab';
import { MistakesBankTab } from '@/features/account/MistakesBankTab';
import { MobileAccountTabs } from '@/features/account/MobileAccountTabs';
import type { StudentMistakeItem } from '@/lib/data/exam-types';
import { DEFAULT_PROFILE, DEFAULT_STATS } from '@/features/account/account-mappers';
import { loadStudentAccountData, deleteStudentMistakes } from '@/features/account/account-data-loader';

const VALID_TABS = new Set<string>(['profile', 'security', 'quizzes', 'homework', 'watch_history', 'mistakes']);

function AccountPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<AccountTabId>(
    (tabParam && VALID_TABS.has(tabParam)) ? (tabParam as AccountTabId) : 'profile'
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    if (tabParam && VALID_TABS.has(tabParam)) {
      setActiveTab(tabParam as AccountTabId);
    }
  }, [tabParam]);

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['student-account-data'],
    queryFn: () => {
      const cachedDash = queryClient.getQueryData(['student-dashboard-data']);
      return loadStudentAccountData(cachedDash, queryClient);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const profile = bundle?.profile || DEFAULT_PROFILE;
  const stats = bundle?.stats || DEFAULT_STATS;
  const enrolledCourses = bundle?.enrolledCourses || [];
  const invoices = bundle?.invoices || [];
  const sessions = bundle?.sessions || [];
  const logoutsToday = bundle?.logoutsToday || 0;
  const logoutsThisWeek = bundle?.logoutsThisWeek || 0;
  const mistakes = bundle?.mistakes || [];
  const watchHistory = bundle?.watchHistory || [];
  const quizResults = bundle?.quizResults || [];
  const homeworkResults = bundle?.homeworkResults || [];

  const handleMistakesUpdated = async (updated: StudentMistakeItem[]) => {
    const remainingIds = new Set(updated.map((m) => m.id));
    const removedIds = mistakes.filter((m) => !remainingIds.has(m.id)).map((m) => m.id);
    if (bundle) {
      queryClient.setQueryData(['student-account-data'], { ...bundle, mistakes: updated });
    }
    if (removedIds.length > 0) {
      try {
        await deleteStudentMistakes(removedIds);
      } catch {}
    }
  };

  const tabsConfig = [
    { id: 'profile', label: 'الملف الشخصي والاشتراكات', icon: User },
    { id: 'security', label: 'الأمان وتاريخ الدخول', icon: Shield },
    { id: 'quizzes', label: 'نتائج الامتحانات', icon: Award, badge: quizResults.length },
    { id: 'homework', label: 'نتائج الواجب', icon: BookOpen, badge: homeworkResults.length },
    { id: 'watch_history', label: 'مشاهدات الفيديوهات', icon: Video, badge: watchHistory.length },
    { id: 'mistakes', label: 'غلطاتي', icon: AlertCircle, badge: mistakes.length },
  ];

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      {/* Top Profile Card */}
      <StudentProfileCard profile={profile} />

      {/* Mobile Vertical Cards Tabs (< md) */}
      <MobileAccountTabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id)}
      />

      {/* Desktop Tabs navigation bar */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white p-1.5 sm:p-2 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div className="flex items-center gap-1.5">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AccountTabId)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 ${
                  isActive
                    ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#071719]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                      isActive ? 'bg-white text-bio-teal' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-400 dark:border-teal-500/20 dark:bg-[#091D20]">
          جاري تحميل بيانات حسابك التعليمي من المنصة...
        </div>
      ) : (
        <>
          {activeTab === 'profile' && (
            <ProfileAndBillingTab
              stats={stats}
              enrolledCourses={enrolledCourses}
              invoices={invoices}
            />
          )}

          {activeTab === 'security' && (
            <SecurityAndSessionsTab
              sessions={sessions}
              logoutsToday={logoutsToday}
              logoutsThisWeek={logoutsThisWeek}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizResultsTab quizResults={quizResults} />
          )}

          {activeTab === 'homework' && (
            <HomeworkResultsTab homeworkResults={homeworkResults} />
          )}

          {activeTab === 'watch_history' && (
            <WatchHistoryTab history={watchHistory} />
          )}

          {activeTab === 'mistakes' && (
            <MistakesBankTab
              mistakes={mistakes}
              onMistakesUpdated={handleMistakesUpdated}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function StudentAccountPage() {
  return (
    <Suspense fallback={
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs font-bold text-slate-400 dark:border-teal-500/20 dark:bg-[#091D20]">
        جاري تحميل بيانات حسابك التعليمي من المنصة...
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
