'use client';

import React, { useState, useEffect } from 'react';
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
import type {
  StudentProfile,
  StudentStats,
  EnrolledCourseItem,
  InvoiceItem,
  LoginSessionItem,
} from '@/lib/data/student-profile-data';
import type { StudentMistakeItem, ExamResultSummary, WatchHistoryItem } from '@/lib/data/exam-types';
import { DEFAULT_PROFILE, DEFAULT_STATS } from '@/features/account/account-mappers';
import { loadStudentAccountData, deleteStudentMistakes } from '@/features/account/account-data-loader';

export default function StudentAccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTabId>('profile');
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [stats, setStats] = useState<StudentStats>(DEFAULT_STATS);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [sessions, setSessions] = useState<LoginSessionItem[]>([]);
  const [logoutsToday, setLogoutsToday] = useState(0);
  const [logoutsThisWeek, setLogoutsThisWeek] = useState(0);
  const [mistakes, setMistakes] = useState<StudentMistakeItem[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [quizResults, setQuizResults] = useState<ExamResultSummary[]>([]);
  const [homeworkResults, setHomeworkResults] = useState<ExamResultSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const bundle = await loadStudentAccountData();
        if (isMounted) {
          setProfile(bundle.profile);
          setStats(bundle.stats);
          setEnrolledCourses(bundle.enrolledCourses);
          setInvoices(bundle.invoices);
          setSessions(bundle.sessions);
          setLogoutsToday(bundle.logoutsToday);
          setLogoutsThisWeek(bundle.logoutsThisWeek);
          setMistakes(bundle.mistakes);
          setWatchHistory(bundle.watchHistory);
          setQuizResults(bundle.quizResults);
          setHomeworkResults(bundle.homeworkResults);
        }
      } catch {
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMistakesUpdated = async (updated: StudentMistakeItem[]) => {
    const remainingIds = new Set(updated.map((m) => m.id));
    const removedIds = mistakes.filter((m) => !remainingIds.has(m.id)).map((m) => m.id);
    setMistakes(updated);
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

      {/* Desktop Tabs navigation bar (hidden on mobile, visible on md+) */}
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
