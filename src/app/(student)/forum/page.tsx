'use client';

import React, { useState, useEffect } from 'react';
import { Users, PlusCircle, CheckCircle2 } from 'lucide-react';
import { ForumTabId } from '@/features/forum/forum-types';
import { ForumPostCard } from '@/features/forum/ForumPostCard';
import { NewQuestionModal } from '@/features/forum/NewQuestionModal';
import { ForumPostItem } from '@/lib/data/forum-data';
import { createClient } from '@/lib/supabase/client';
import { PaginationControls } from '@/components/ui/PaginationControls';

const PAGE_SIZE = 10;

export default function StudentForumPage() {
  const [activeTab, setActiveTab] = useState<ForumTabId>('private');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<ForumPostItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [todayQuestionsCount, setTodayQuestionsCount] = useState(0);
  const [successToast, setSuccessToast] = useState('');

  const MAX_DAILY_QUESTIONS = 5;
  const remainingToday = Math.max(0, MAX_DAILY_QUESTIONS - todayQuestionsCount);

  const fetchForumQuestions = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data } = await supabase
        .from('forum_questions')
        .select('id, student_id, question_text, question_image_url, status, is_public, reply_text, reply_image_url, reply_voice_url, replied_at, created_at, profiles:student_id(full_name, grade_level)')
        .order('created_at', { ascending: false });

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: ForumPostItem[] = data.map((q: any) => {
          const isMine = q.student_id === user?.id;
          return {
            id: q.id,
            authorName: isMine ? `${q.profiles?.full_name || 'أنا'} (أنا)` : (q.profiles?.full_name || 'طالب المنصة'),
            authorGrade: `الصف ${q.profiles?.grade_level || '3'} الثانوي`,
            isMine,
            timeAgo: 'مؤخراً',
            createdAt: q.created_at ? q.created_at.split('T')[0] : 'اليوم',
            status: q.status,
            questionTitle: q.question_text.slice(0, 60),
            questionText: q.question_text,
            questionImageUrl: q.question_image_url,
            isPublicApproved: !!q.is_public,
            teacherReply: q.reply_text ? {
              teacherName: 'مستر عمار رزق',
              teacherRole: 'مدرس الأحياء للثانوية العامة',
              timeAgo: 'الآن',
              replyText: q.reply_text,
              replyImageUrl: q.reply_image_url,
              voiceNote: q.reply_voice_url ? { audioUrl: q.reply_voice_url, durationSeconds: 60 } : undefined,
            } : undefined,
          };
        });
        setPosts(mapped);
        if (user) {
          const userToday = mapped.filter((p) => p.isMine).length;
          setTodayQuestionsCount(userToday);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchForumQuestions();
  }, []);

  const handleAddNewQuestion = async (data: { title: string; text: string; imageBlobUrl?: string }) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('forum_questions').insert({
        student_id: user.id,
        question_text: data.text.trim() || data.title.trim(),
        question_image_url: data.imageBlobUrl || null,
        grade_level: '3',
        is_public: false,
        status: 'pending',
      });

      if (!error) {
        await fetchForumQuestions();
        setIsModalOpen(false);
        setCurrentPage(1);
        setSuccessToast('تم إرسال سؤالك العلمي بنجاح، وسيقوم مستر عمار بالرد قريباً ✅');
        setTimeout(() => setSuccessToast(''), 4500);
      }
    } catch {}
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'private') return post.isMine;
    if (activeTab === 'public') return post.isPublicApproved;
    if (activeTab === 'pending') return post.status === 'pending';
    return true;
  });

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + PAGE_SIZE);

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
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
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
        {paginatedPosts.length === 0 ? (
          <div className="py-12 text-center text-xs font-bold text-slate-400 rounded-2xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/20 p-8">
            لا توجد أسئلة في هذا القسم حالياً
          </div>
        ) : (
          <>
            {paginatedPosts.map((post) => (
              <ForumPostCard key={post.id} post={post} />
            ))}
            <PaginationControls
              currentPage={currentPage}
              totalItems={filteredPosts.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemLabel="سؤال"
            />
          </>
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
