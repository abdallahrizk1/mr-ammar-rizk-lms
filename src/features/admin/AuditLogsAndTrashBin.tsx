'use client';

import React, { useState, useEffect } from 'react';
import { History, Trash2, RotateCcw, Shield, Clock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AuditLogItem {
  id: string;
  actor_id: string;
  action_type: string;
  target_id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
  created_at: string;
}

interface SoftDeletedItem {
  id: string;
  type: 'course' | 'lesson' | 'exam' | 'student';
  title: string;
  deleted_at: string;
}

export function AuditLogsAndTrashBin() {
  const [activeTab, setActiveTab] = useState<'audit' | 'trash'>('audit');
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [trashItems, setTrashItems] = useState<SoftDeletedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogsAndTrash = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const [logsRes, coursesRes, lessonsRes, examsRes, studentsRes] = await Promise.all([
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('courses').select('id, title, deleted_at').not('deleted_at', 'is', null),
        supabase.from('lessons').select('id, title, deleted_at').not('deleted_at', 'is', null),
        supabase.from('exams').select('id, title, deleted_at').not('deleted_at', 'is', null),
        supabase.from('profiles').select('id, full_name, deleted_at').eq('role', 'student').not('deleted_at', 'is', null),
      ]);

      if (logsRes.data) setLogs(logsRes.data);

      const trash: SoftDeletedItem[] = [
        ...(coursesRes.data || []).map((c) => ({ id: c.id, type: 'course' as const, title: c.title, deleted_at: c.deleted_at })),
        ...(lessonsRes.data || []).map((l) => ({ id: l.id, type: 'lesson' as const, title: l.title, deleted_at: l.deleted_at })),
        ...(examsRes.data || []).map((e) => ({ id: e.id, type: 'exam' as const, title: e.title, deleted_at: e.deleted_at })),
        ...(studentsRes.data || []).map((s) => ({ id: s.id, type: 'student' as const, title: s.full_name, deleted_at: s.deleted_at })),
      ];
      setTrashItems(trash);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogsAndTrash();
  }, []);

  const handleRestore = async (item: SoftDeletedItem) => {
    try {
      const supabase = createClient();
      const table = item.type === 'course' ? 'courses' : item.type === 'lesson' ? 'lessons' : item.type === 'exam' ? 'exams' : 'profiles';
      const { error } = await supabase.from(table).update({ deleted_at: null }).eq('id', item.id);
      if (!error) {
        setTrashItems((prev) => prev.filter((i) => i.id !== item.id));
      }
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-5" dir="rtl">
      <div className="flex items-center justify-between border-b pb-3 dark:border-teal-500/20">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
            <span>سجل المراقبة وسلة المحذوفات (Trash Bin)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            تتبع عمليات المساعدين مع إمكانية استرجاع أي عنصر محذوف بالخطأ
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#071719]">
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'audit' ? 'bg-white dark:bg-[#0D2628] text-bio-teal shadow-sm' : 'text-slate-500'
            }`}
          >
            سجل العمليات ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'trash' ? 'bg-white dark:bg-[#0D2628] text-rose-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            سلة المحذوفات ({trashItems.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">جارٍ جلب البيانات...</div>
      ) : activeTab === 'audit' ? (
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              لا توجد عمليات مسجلة في سجل المراقبة حتى الآن
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-[#071719] text-slate-600 dark:text-teal-300 border-b">
                  <tr>
                    <th className="p-2.5">نوع العملية</th>
                    <th className="p-2.5">المعرف المستهدف</th>
                    <th className="p-2.5">التفاصيل</th>
                    <th className="p-2.5">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10 font-mono">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-[#071719]/40">
                      <td className="p-2.5 font-bold font-sans text-bio-teal dark:text-emerald-400">{l.action_type}</td>
                      <td className="p-2.5 text-slate-400 text-[11px]">{l.target_id || '—'}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300 text-[11px] max-w-xs truncate">
                        {JSON.stringify(l.details)}
                      </td>
                      <td className="p-2.5 text-slate-400 text-[11px] font-sans">
                        {new Date(l.created_at).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {trashItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
              سلة المحذوفات فارغة (لا توجد عناصر محذوفة) ♻️
            </div>
          ) : (
            trashItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/5"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-rose-500" />
                    <span>{item.title}</span>
                    <span className="text-[10px] text-rose-600 px-1.5 py-0.5 rounded bg-rose-500/10 font-mono">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    تاريخ الحذف: {new Date(item.deleted_at).toLocaleString('ar-EG')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestore(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>استرجاع ♻️</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
