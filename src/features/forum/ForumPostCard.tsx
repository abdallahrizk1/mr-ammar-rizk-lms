'use client';

import React from 'react';
import { MessageCircle, Clock, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { ForumPostItem } from '@/lib/data/forum-data';
import { ForumVoiceNotePlayer } from './ForumVoiceNotePlayer';

interface ForumPostCardProps {
  post: ForumPostItem;
}

export function ForumPostCard({ post }: ForumPostCardProps) {
  const isAnswered = post.status === 'answered';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] space-y-3" dir="rtl">
      {/* Post Author & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-teal-500/15">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#071719] text-slate-700 dark:text-slate-300">
            <User className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {post.authorName}
              </span>
              <span className="rounded-md bg-slate-100 dark:bg-[#071719] px-1.5 py-0.2 text-[10px] text-slate-500 dark:text-teal-300/60">
                {post.authorGrade}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {post.timeAgo} • {post.createdAt}
            </span>
          </div>
        </div>

        <div>
          {isAnswered ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3" />
              تم الرد بواسطة مستر عمار
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="h-3 w-3" />
              قيد انتظار رد المدرس
            </span>
          )}
        </div>
      </div>

      {/* Question Title & Content */}
      <div className="space-y-1.5">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
          ❓ {post.questionTitle}
        </h3>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {post.questionText}
        </p>

        {post.questionImageUrl && (
          <div className="rounded-xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] p-2 max-w-sm">
            <span className="text-[10px] font-bold text-slate-400 block mb-1">
              📷 صورة المسألة المرفقة:
            </span>
            <img
              src={post.questionImageUrl}
              alt="صورة السؤال"
              className="rounded-lg object-contain max-h-48 w-full"
            />
          </div>
        )}
      </div>

      {/* Teacher Answer Section */}
      {isAnswered && post.replyText && (
        <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 dark:bg-[#071719] p-3 sm:p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-bio-teal dark:text-emerald-300">
              <MessageCircle className="h-4 w-4" />
              <span>{post.repliedBy || 'مستر عمار رزق 🧬'}</span>
            </div>
            <span className="text-[10px] text-slate-400">رد علمي معتمد</span>
          </div>

          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {post.replyText}
          </p>

          {/* Teacher Explanatory Image */}
          {post.replyImageUrl && (
            <div className="rounded-xl border border-bio-teal/20 dark:border-teal-500/30 bg-white dark:bg-[#071719] p-2.5 max-w-sm">
              <span className="text-[10px] font-bold text-bio-teal dark:text-emerald-400 block mb-1">
                🖼️ رسمة / صورة توضيحية من مستر عمار:
              </span>
              <img
                src={post.replyImageUrl}
                alt="توضيح مستر عمار"
                className="rounded-lg object-contain max-h-48 w-full border border-slate-100 dark:border-teal-500/20"
              />
            </div>
          )}

          {/* Interactive Voice Note Player */}
          {post.replyVoiceNote && (
            <div className="pt-1">
              <ForumVoiceNotePlayer voiceNote={post.replyVoiceNote} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
