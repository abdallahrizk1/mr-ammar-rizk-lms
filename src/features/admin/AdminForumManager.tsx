'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, RefreshCw, Globe, Lock, Send, User, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';

interface ForumQuestionItem {
  id: string;
  student_id: string;
  question_text: string;
  question_image_url: string | null;
  status: 'pending' | 'answered';
  reply_text: string | null;
  is_public: boolean;
  created_at: string;
  student_name?: string;
}

export function AdminForumManager() {
  const [questions, setQuestions] = useState<ForumQuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<ForumQuestionItem | null>(null);

  // Reply form state
  const [replyText, setReplyText] = useState('');
  const [replyImageUrl, setReplyImageUrl] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('forum_questions')
        .select('id, student_id, question_text, question_image_url, status, reply_text, is_public, created_at, profiles:student_id(full_name)')
        .order('created_at', { ascending: false });

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: ForumQuestionItem[] = data.map((q: any) => ({
          id: q.id,
          student_id: q.student_id,
          question_text: q.question_text,
          question_image_url: q.question_image_url,
          status: q.status,
          reply_text: q.reply_text,
          is_public: q.is_public,
          created_at: q.created_at,
          student_name: q.profiles?.full_name || 'طالب المنصة',
        }));
        setQuestions(mapped);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    if (!replyText.trim() && !voiceBlob && !replyImageUrl.trim()) return;

    setIsSending(true);
    try {
      const supabase = createClient();
      const voicePath = voiceBlob ? `/audio/reply-${selectedQuestion.id}-${Date.now()}.mp4` : null;

      const { error } = await supabase
        .from('forum_questions')
        .update({
          reply_text: replyText.trim() || 'تم الرد صوتياً من مستر عمار رزق 🎙️',
          reply_image_url: replyImageUrl.trim() || null,
          reply_voice_url: voicePath,
          is_public: isPublic,
          status: 'answered',
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedQuestion.id);

      if (!error) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === selectedQuestion.id
              ? {
                  ...q,
                  status: 'answered',
                  reply_text: replyText.trim() || 'تم الرد',
                  is_public: isPublic,
                }
              : q
          )
        );
        setSelectedQuestion(null);
        setReplyText('');
        setReplyImageUrl('');
        setVoiceBlob(null);
      }
    } catch {}
    setIsSending(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
            <span>منتدى أسئلة الطلاب والردود الصوتية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            الرد كتابياً أو صوتياً بالمايك (audio/mp4) مع تحديد النشر العام للدفعة أو الخاص
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQuestions}
          className="p-2 rounded-xl border border-slate-200 dark:border-teal-500/20 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
          title="تحديث"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">جارٍ جلب الأسئلة...</div>
      ) : questions.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">لا توجد أسئلة في المنتدى حالياً</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Questions Column */}
          <div className="lg:col-span-5 space-y-2 max-h-[550px] overflow-y-auto">
            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setReplyText(q.reply_text || '');
                    setIsPublic(q.is_public);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-right ${
                    isSelected
                      ? 'border-bio-teal bg-teal-50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-teal-500/10 hover:bg-slate-50 dark:hover:bg-[#071719]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-bio-teal dark:text-emerald-400" />
                      <span>{q.student_name}</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      q.status === 'answered'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    }`}>
                      {q.status === 'answered' ? 'تم الرد ✅' : 'بانتظار الرد ⏳'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2 mt-1">
                    {q.question_text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Reply Form Column */}
          <div className="lg:col-span-7">
            {selectedQuestion ? (
              <form onSubmit={handleSendReply} className="rounded-2xl border p-4 bg-slate-50 dark:bg-[#071719] space-y-4">
                <div className="border-b pb-2.5 dark:border-teal-500/20">
                  <span className="text-xs font-bold text-slate-500">سؤال الطالب:</span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {selectedQuestion.question_text}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">نص الإجابة والتوضيح</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب التوضيح أو ملخص الإجابة للطالب..."
                    rows={3}
                    className="w-full rounded-xl border p-2.5 text-xs dark:bg-[#0D2628]"
                  />
                </div>

                {/* Voice Note Recorder */}
                <VoiceNoteRecorder
                  onAudioRecorded={(blob) => setVoiceBlob(blob)}
                  onClear={() => setVoiceBlob(null)}
                />

                <div className="flex items-center gap-2 p-2.5 rounded-xl border bg-white dark:bg-[#0D2628]">
                  <input
                    type="checkbox"
                    id="isPublicToggle"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded accent-bio-teal"
                  />
                  <label htmlFor="isPublicToggle" className="text-xs font-bold cursor-pointer flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-bio-teal" />
                    <span>نشر السؤال والرد في المنتدى العام للدفعة (ليستفيد الجميع)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs font-bold shadow hover:bg-bio-deep"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSending ? 'جارٍ الإرسال...' : 'إرسال الرد للطالب'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-xs text-slate-400 border border-dashed rounded-2xl">
                اختر سؤالاً من القائمة للرد عليه كتابياً أو تسجيل ريكورد صوتي
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
