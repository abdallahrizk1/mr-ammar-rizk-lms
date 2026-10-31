'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ExternalLink, RefreshCw, AlertTriangle, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ReceiptItem {
  id: string;
  student_id: string;
  course_id: string;
  sender_phone: string;
  reference_number: string;
  receipt_image_r2_path: string;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  student_name?: string;
  course_title?: string;
}

export function ReceiptReviewTable() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('payment_receipts')
        .select(`
          id, student_id, course_id, sender_phone, reference_number, receipt_image_r2_path, status, created_at,
          profiles:student_id (full_name),
          courses:course_id (title)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: ReceiptItem[] = data.map((r: any) => ({
          id: r.id,
          student_id: r.student_id,
          course_id: r.course_id,
          sender_phone: r.sender_phone,
          reference_number: r.reference_number,
          receipt_image_r2_path: r.receipt_image_r2_path || '/images/teacher-circle.png',
          status: r.status,
          created_at: r.created_at,
          student_name: r.profiles?.full_name || 'طالب المنصة',
          course_title: r.courses?.title || 'كورس الأحياء',
        }));
        setReceipts(mapped);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('payment_receipts')
        .update({ status: 'approved' })
        .eq('id', id);

      if (!error) {
        setReceipts((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
        );
      }
    } catch {}
  };

  const handleReject = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('payment_receipts')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (!error) {
        setReceipts((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
        );
      }
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            مراجعة إيصالات فودافون كاش وإنستا باي
          </h3>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            الإيصالات المعلقة (pending_review) تتطلب الموافقة والتفعيل النهائي
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReceipts}
          className="p-2 rounded-xl border border-slate-200 dark:border-teal-500/20 text-slate-600 hover:bg-slate-100 dark:text-slate-300"
          title="تحديث"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">جارٍ جلب الإيصالات...</div>
      ) : receipts.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">لا توجد إيصالات مسجلة حالياً</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-[#071719] text-slate-600 dark:text-teal-300 border-b">
              <tr>
                <th className="p-2.5">الطالب</th>
                <th className="p-2.5">الكورس</th>
                <th className="p-2.5">الرقم المحول منه</th>
                <th className="p-2.5">الرقم المرجعي</th>
                <th className="p-2.5">صورة الإيصال</th>
                <th className="p-2.5">الحالة</th>
                <th className="p-2.5 text-center">إجراء الأدمن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-[#071719]/40">
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{r.student_name}</td>
                  <td className="p-2.5 text-slate-600 dark:text-slate-300">{r.course_title}</td>
                  <td className="p-2.5 font-mono dir-ltr text-right">{r.sender_phone}</td>
                  <td className="p-2.5 font-mono text-bio-teal dark:text-emerald-400">{r.reference_number}</td>
                  <td className="p-2.5">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(r.receipt_image_r2_path)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-bio-teal dark:text-emerald-400 hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>معاينة</span>
                    </button>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        r.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : r.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {r.status === 'approved' ? 'مفعل نهائي ✅' : r.status === 'rejected' ? 'مرفوض ❌' : 'قيد المراجعة ⏳'}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    {r.status === 'pending_review' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition text-[11px]"
                        >
                          قبول وتفعيل ✅
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500 transition text-[11px]"
                        >
                          رفض ❌
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">تم اتخاذ إجراء</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewImage(null)}>
          <div className="max-w-lg w-full bg-white dark:bg-[#0D2628] rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-bold">صورة إيصال التحويل</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="إيصال التحويل" className="max-h-96 w-full object-contain rounded-xl border" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="w-full py-2 bg-slate-100 dark:bg-[#071719] rounded-xl text-xs font-bold"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
