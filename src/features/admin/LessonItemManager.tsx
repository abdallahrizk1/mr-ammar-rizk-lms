'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Video, FileText, CheckSquare, Lock, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminLesson, AdminLessonItem } from './admin-types';

interface LessonItemManagerProps {
  lesson: AdminLesson;
}

export function LessonItemManager({ lesson }: LessonItemManagerProps) {
  const [items, setItems] = useState<AdminLessonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [itemType, setItemType] = useState<AdminLessonItem['item_type']>('video');
  const [title, setTitle] = useState('');
  const [r2Path, setR2Path] = useState('');
  const [durationSec, setDurationSec] = useState('1800');
  const [unlockAfterExam, setUnlockAfterExam] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [exams, setExams] = useState<{ id: string; title: string }[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const [itemsRes, examsRes] = await Promise.all([
        supabase
          .from('lesson_items')
          .select('*')
          .eq('lesson_id', lesson.id)
          .is('deleted_at', null)
          .order('sort_order', { ascending: true }),
        supabase
          .from('exams')
          .select('id, title')
          .eq('lesson_id', lesson.id)
          .is('deleted_at', null),
      ]);

      if (itemsRes.data) setItems(itemsRes.data);
      if (examsRes.data) {
        setExams(examsRes.data);
        if (examsRes.data.length > 0) setSelectedExamId(examsRes.data[0].id);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [lesson.id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('lesson_items')
        .insert({
          lesson_id: lesson.id,
          title: title.trim(),
          item_type: itemType,
          sort_order: items.length + 1,
          r2_path_or_url: r2Path.trim() || null,
          duration_seconds: itemType === 'video' ? Number(durationSec) || 0 : null,
          unlock_after_exam_id: unlockAfterExam && selectedExamId ? selectedExamId : null,
        })
        .select()
        .single();

      if (data) {
        setItems((prev) => [...prev, data]);
        setTitle('');
        setR2Path('');
        setIsModalOpen(false);
      }
    } catch {}
    setIsSaving(false);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const supabase = createClient();
      await supabase.from('lesson_items').update({ deleted_at: new Date().toISOString() }).eq('id', id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-teal-500/20 dark:bg-[#091D20] space-y-4" dir="rtl">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-500/10 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>عناصر ومحتويات المحاضرة:</span>
            <span className="text-bio-teal dark:text-emerald-400">{lesson.title}</span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-teal-200/60 mt-0.5">
            فيديو HLS، مذكرة PDF، كويز، واجب، وفيديوهات الحل المقفولة
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs font-bold hover:bg-bio-deep"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>إضافة عنصر للمحاضرة</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-xs text-slate-400">جارٍ تحميل العناصر...</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          لم يتم إضافة أي عناصر لهذه المحاضرة بعد. انقر على &quot;إضافة عنصر&quot; لرفع فيديو أو مذكرة.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-teal-500/10 bg-slate-50 dark:bg-[#071719]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                {item.item_type.includes('video') ? (
                  <Video className="h-4 w-4 text-emerald-500" />
                ) : item.item_type.includes('pdf') ? (
                  <FileText className="h-4 w-4 text-blue-500" />
                ) : (
                  <CheckSquare className="h-4 w-4 text-amber-500" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{item.title}</span>
                    {item.unlock_after_exam_id && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        <Lock className="h-2.5 w-2.5" />
                        <span>يفتح بعد الامتحان</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {item.item_type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleAddItem} className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D2628] p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">إضافة عنصر جديد للمحاضرة</h4>

            <div>
              <label className="text-[11px] font-bold block mb-1">نوع العنصر</label>
              <select
                value={itemType}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e) => setItemType(e.target.value as any)}
                className="w-full rounded-xl border p-2 text-xs dark:bg-[#071719]"
              >
                <option value="video">فيديو شرح HLS</option>
                <option value="pdf">مذكرة شرح PDF</option>
                <option value="quiz">كويز المحاضرة</option>
                <option value="homework">واجب المحاضرة</option>
                <option value="solution_video">فيديو حل الكويز / الواجب</option>
                <option value="solution_pdf">ملف إجابات ونموذج حل PDF</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold block mb-1">عنوان العنصر *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: فيديو شرح الجزء الأول من الدعامة"
                className="w-full rounded-xl border p-2 text-xs dark:bg-[#071719]"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold block mb-1">مسار الملف في Cloudflare R2 / URL</label>
              <input
                type="text"
                value={r2Path}
                onChange={(e) => setR2Path(e.target.value)}
                placeholder="r2://courses/chapter-1/lecture-1/master.m3u8"
                className="w-full rounded-xl border p-2 text-xs dark:bg-[#071719] text-left"
                dir="ltr"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#071719] border text-xs">
              <input
                type="checkbox"
                id="unlockCheck"
                checked={unlockAfterExam}
                onChange={(e) => setUnlockAfterExam(e.target.checked)}
                className="h-4 w-4 rounded accent-bio-teal"
              />
              <label htmlFor="unlockCheck" className="cursor-pointer font-bold">
                🔒 قفل هذا العنصر حتى يقوم الطالب بتسليم الامتحان
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 rounded-lg border text-xs">إلغاء</button>
              <button type="submit" disabled={isSaving} className="px-4 py-1.5 rounded-lg bg-bio-teal text-white text-xs font-bold">
                {isSaving ? 'جارٍ الإضافة...' : 'إضافة العنصر'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
