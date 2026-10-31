'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, CheckCircle2, History } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  target_type: string;
  created_at: string;
}

export function NotificationSender() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'grade' | 'course'>('all');
  const [targetValue, setTargetValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchRecentNotifications = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setNotifications(data);
    } catch {}
  };

  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSending(true);
    setIsSuccess(false);
    try {
      const supabase = createClient();
      const insertPayload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        target_type: targetType,
      };

      if (targetType === 'grade') {
        insertPayload.target_grade_level = targetValue || '3';
      } else if (targetType === 'course') {
        insertPayload.target_course_id = targetValue || null;
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert(insertPayload)
        .select()
        .single();

      if (!error && data) {
        setIsSuccess(true);
        setTitle('');
        setBody('');
        setNotifications((prev) => [data, ...prev]);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch {}
    setIsSending(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-6" dir="rtl">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
          <span>مركز إرسال الإشعارات والتنبيهات المباشرة</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
          إرسال تنبيهات عامة أو مخصصة لصف دراسي أو مشتركي كورس معين تظهر في جرس الإشعارات
        </p>
      </div>

      <form onSubmit={handleSendNotification} className="rounded-2xl border p-4 bg-slate-50 dark:bg-[#071719] space-y-4">
        {isSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>تم إرسال الإشعار لجميع المستهدفين بنجاح! 🎉</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold block mb-1">الجمهور المستهدف *</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'all', label: 'جميع الطلاب (الكل)' },
              { type: 'grade', label: 'صف دراسي معين' },
              { type: 'course', label: 'مشتركو كورس محدد' },
            ].map((t) => (
              <button
                key={t.type}
                type="button"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setTargetType(t.type as any)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  targetType === t.type
                    ? 'border-bio-teal bg-teal-50 text-bio-teal dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-slate-200 bg-white dark:bg-[#091D20] text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {targetType === 'grade' && (
          <div>
            <label className="text-xs font-bold block mb-1">اختر الصف الدراسي</label>
            <select
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full p-2.5 rounded-xl border text-xs dark:bg-[#091D20]"
            >
              <option value="1">الصف الأول الثانوي</option>
              <option value="2">الصف الثاني الثانوي</option>
              <option value="3">الصف الثالث الثانوي</option>
            </select>
          </div>
        )}

        <div>
          <label className="text-xs font-bold block mb-1">عنوان الإشعار *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: تم رفع المحاضرة الثالثة من باب الدعامة 🧬"
            className="w-full p-2.5 rounded-xl border text-xs dark:bg-[#091D20]"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">تفاصيل ومحتوى الإشعار *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="اكتب التنبيه أو التوجيه الخاص بالمحاضرة أو الامتحان..."
            rows={3}
            className="w-full p-2.5 rounded-xl border text-xs dark:bg-[#091D20]"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs font-bold shadow hover:bg-bio-deep"
        >
          <Send className="h-4 w-4" />
          <span>{isSending ? 'جارٍ البث...' : 'إرسال الإشعار الآن 🚀'}</span>
        </button>
      </form>

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <History className="h-4 w-4" />
          <span>سجل آخر الإشعارات المرسلة</span>
        </h3>

        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="p-3 rounded-xl border border-slate-100 dark:border-teal-500/10 bg-slate-50 dark:bg-[#071719] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{n.body}</div>
              </div>
              <span className="text-[10px] text-slate-400">{n.created_at.split('T')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
