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
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_STUDENT_STATS,
  INITIAL_INVOICES,
  INITIAL_LOGIN_SESSIONS,
  StudentProfile,
} from '@/lib/data/student-profile-data';
import { StudentMistakeItem } from '@/lib/data/exam-types';
import {
  SAMPLE_QUIZ_RESULTS,
  SAMPLE_HOMEWORK_RESULTS,
  SAMPLE_EXAM_QUESTIONS,
} from '@/lib/data/exam-data';
import {
  getStoredEnrolledCourses,
  getStoredMistakes,
  getLogoutStats,
  getStoredWatchHistory,
  getStoredExamSubmissions,
} from '@/lib/utils/student-storage';
import { ExamResultSummary, WatchHistoryItem } from '@/lib/data/exam-types';

export default function StudentAccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTabId>('profile');
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [enrolledCourses, setEnrolledCourses] = useState(() => getStoredEnrolledCourses());
  const [mistakes, setMistakes] = useState<StudentMistakeItem[]>(() => getStoredMistakes());
  const [logoutStats, setLogoutStats] = useState(() => getLogoutStats());
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => getStoredWatchHistory());
  const [quizResults, setQuizResults] = useState<ExamResultSummary[]>(SAMPLE_QUIZ_RESULTS);
  const [homeworkResults, setHomeworkResults] = useState<ExamResultSummary[]>(SAMPLE_HOMEWORK_RESULTS);

  useEffect(() => {
    setEnrolledCourses(getStoredEnrolledCourses());
    setMistakes(getStoredMistakes());
    setLogoutStats(getLogoutStats());
    setWatchHistory(getStoredWatchHistory());

    const submissions = getStoredExamSubmissions();
    const dynamicQuizzes: ExamResultSummary[] = [];
    const dynamicHomework: ExamResultSummary[] = [];

    Object.values(submissions).forEach((sub) => {
      const summary: ExamResultSummary = {
        id: sub.examId,
        examName: sub.examTitle,
        totalQuestions: sub.total,
        score: sub.score,
        percentage: sub.percentage,
        solvedCount: sub.total,
        correctCount: sub.score,
        startTime: 'اليوم',
        endTime: sub.submittedAt,
        questions: SAMPLE_EXAM_QUESTIONS,
        studentAnswers: {},
      };
      if (sub.isHomework) {
        dynamicHomework.push(summary);
      } else {
        dynamicQuizzes.push(summary);
      }
    });

    if (dynamicQuizzes.length > 0) {
      setQuizResults([...dynamicQuizzes, ...SAMPLE_QUIZ_RESULTS]);
    }
    if (dynamicHomework.length > 0) {
      setHomeworkResults([...dynamicHomework, ...SAMPLE_HOMEWORK_RESULTS]);
    }

    const rawAuth = localStorage.getItem('lms_preview_auth_user');
    if (rawAuth) {
      try {
        const parsed = JSON.parse(rawAuth);
        setProfile((prev) => ({
          ...prev,
          name: parsed.fullName || prev.name,
          phone: parsed.phone || prev.phone,
          parentPhone: parsed.parentPhone || prev.parentPhone,
          governorate: parsed.governorate || prev.governorate,
          grade: parsed.grade || prev.grade,
        }));
      } catch {}
    }
  }, []);

  const tabsConfig = [
    { id: 'profile', label: 'الملف الشخصي والاشتراكات', icon: User },
    { id: 'security', label: 'الأمان وتاريخ الدخول', icon: Shield },
    { id: 'quizzes', label: 'نتائج الامتحانات', icon: Award },
    { id: 'homework', label: 'نتائج الواجب', icon: BookOpen },
    { id: 'watch_history', label: 'مشاهدات الفيديوهات', icon: Video },
    { id: 'mistakes', label: 'غلطاتي', icon: AlertCircle, badge: mistakes.length },
  ];

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      {/* Fixed top profile card */}
      <StudentProfileCard profile={profile} />

      {/* Tabs navigation bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-1.5 sm:p-2 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
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

      {/* 6 Tabs Body */}
      {activeTab === 'profile' && (
        <ProfileAndBillingTab
          stats={INITIAL_STUDENT_STATS}
          enrolledCourses={enrolledCourses}
          invoices={INITIAL_INVOICES}
        />
      )}

      {activeTab === 'security' && (
        <SecurityAndSessionsTab
          sessions={INITIAL_LOGIN_SESSIONS}
          logoutsToday={logoutStats.today}
          logoutsThisWeek={logoutStats.thisWeek}
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
          onMistakesUpdated={(updated) => setMistakes(updated)}
        />
      )}
    </div>
  );
}
