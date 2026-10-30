'use client';

import React, { useState } from 'react';
import { Users, PlusCircle, CheckCircle2 } from 'lucide-react';
import { ForumTabId } from '@/features/forum/forum-types';
import { ForumPostCard } from '@/features/forum/ForumPostCard';
import { NewQuestionModal } from '@/features/forum/NewQuestionModal';
import { ForumPostItem } from '@/lib/data/forum-data';
import { getStoredForumPosts, addStoredForumPost } from '@/lib/utils/student-storage';

export default function StudentForumPage() {
  const [activeTab, setActiveTab] = useState<ForumTabId>('private');
  const [posts, setPosts] = useState<ForumPostItem[]>(() => getStoredForumPosts());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayQuestionsCount, setTodayQuestionsCount] = useState(2);
  const [successToast, setSuccessToast] = useState('');

  const MAX_DAILY_QUESTIONS = 5;
  const remainingToday = Math.max(0, MAX_DAILY_QUESTIONS - todayQuestionsCount);

  // Tab 1: أسئلتي الخاصة (Default) - Only this student's questions
  // Tab 2: المنتدى العام للدفعة - Questions answered and approved for public broadcast
  // Tab 3: قيد المراجعة - Questions waiting under review
  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'private') return p.isMine;
    if (activeTab === 'public') return p.isPublicApproved;
    if (activeTab === 'pending') return p.status === 'pending';
    return true;
  });

  const handleAddNewQuestion = (data: { title: string; text: string; imageBlobUrl?: string }) => {
    const newPost: ForumPostItem = {
      id: `post-${Date.now()}`,
      authorName: 'أحمد محمد العوضي (أنا)',
      authorGrade: 'الصف الثالث الثانوي',
      isMine: true,
      timeAgo: 'الآن',
      createdAt: 'اليوم',
      status: 'pending',
      questionTitle: data.title,
      questionText: data.text,
      questionImageUrl: data.imageBlobUrl,
      isPublicApproved: false,
    };

    addStoredForumPost(newPost);
    setPosts((prev) => [newPost, ...prev]);
    setTodayQuestionsCount((c) => c + 1);
    setIsModalOpen(false);
    setSuccessToast('تم إرسال سؤالك العلمي بنجاح، وسيقوم مستر عمار بالرد قريباً ✅');
    setTimeout(() => setSuccessToast(''), 4500);
  };

  const tabsConfig = [
    {
      id: 'private' as ForumTabId,
      label: 'أسئلتي الخاصة',
      badge: posts.filter((p) => p.isMine).length,
    },
    {
      id: 'public' as ForumTabId,
      label: 'المنتدى العام للدفعة',
      badge: posts.filter((p) => p.isPublicApproved).length,
    },
    {
      id: 'pending' as ForumTabId,
      label: 'قيد المراجعة',
      badge: posts.filter((p) => p.status === 'pending').length,
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div>
          <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
            <span>المنتدى العلمي وغرفة الأسئلة الخاصة</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            تواصل مباشرة مع مستر عمار رزق واحصل على إجابات نصية وصوتية متخصصة
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>طرح سؤال جديد</span>
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 3 Tabs Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-1.5 sm:p-2 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {tabsConfig.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 ${
                  isActive
                    ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#071719]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isActive ? 'bg-white text-bio-teal' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/20 p-8">
            لا توجد أسئلة في هذا القسم حالياً
          </div>
        ) : (
          filteredPosts.map((post) => (
            <ForumPostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* New Question Modal */}
      {isModalOpen && (
        <NewQuestionModal
          remainingQuestionsToday={remainingToday}
          maxDailyQuestions={MAX_DAILY_QUESTIONS}
          onSubmit={handleAddNewQuestion}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
