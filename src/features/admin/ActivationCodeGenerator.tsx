'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { AdminCourse } from './admin-types';

interface CodeItem {
  id: string;
  code: string;
  course_id: string;
  price_amount: number;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
  course_title?: string;
}

export function ActivationCodeGenerator() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCoursesAndCodes = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const [coursesRes, codesRes] = await Promise.all([
        supabase.from('courses').select('*').is('deleted_at', null).order('title'),
        supabase
          .from('activation_codes')
          .select('id, code, course_id, price_amount, is_used, used_by, created_at, courses(title)')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (coursesRes.data) {
        setCourses(coursesRes.data);
        if (coursesRes.data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(coursesRes.data[0].id);
        }
      }
      if (codesRes.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: CodeItem[] = codesRes.data.map((c: any) => ({
          id: c.id,
          code: c.code,
          course_id: c.course_id,
          price_amount: c.price_amount,
          is_used: c.is_used,
          used_by: c.used_by,
          created_at: c.created_at,
          course_title: c.courses?.title || 'كورس الأحياء',
        }));
        setCodes(mapped);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCoursesAndCodes();
  }, []);

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    const count = Math.min(500, Math.max(1, Number(quantity) || 10));
    const targetCourse = courses.find((c) => c.id === selectedCourseId);
    const priceAmount = targetCourse?.price || 350;

    setIsGenerating(true);
    try {
      const supabase = createClient();
      const newCodesPayload = [];

      for (let i = 0; i < count; i++) {
        const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const randHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `AMMAR-${randHex}-${randHex2}`;
        newCodesPayload.push({
          code,
          course_id: selectedCourseId,
          price_amount: priceAmount,
          is_used: false,
        });
      }

      const { data, error } = await supabase.from('activation_codes').insert(newCodesPayload).select();

      if (!error && data) {
        fetchCoursesAndCodes();
      }
    } catch {}
    setIsGenerating(false);
  };

  const exportCodesToExcel = () => {
    if (codes.length === 0) return;

    // Excel UTF-8 with BOM CSV
    const bom = '\uFEFF';
    let csv = `${bom}الكود,اسم الكورس,السعر,الحالة,تاريخ التوليد\n`;

    codes.forEach((c) => {
      const statusText = c.is_used ? 'تم استخدامه' : 'متاح للبيع';
      const cleanTitle = `"${(c.course_title || '').replace(/"/g, '""')}"`;
      csv += `${c.code},${cleanTitle},${c.price_amount},${statusText},${c.created_at.split('T')[0]}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `اكواد_سنتر_مستر_عمار_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-5" dir="rtl">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
          <span>مولّد أكواد الشحن والتفعيل للسناتر (Activation Codes)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
          توليد مجموعات أكواد للسنتر والمكتبات مع إمكانية التصدير الفوري لملف Excel جاهز للطباعة
        </p>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerateCodes} className="rounded-2xl border p-4 bg-slate-50 dark:bg-[#071719] dark:border-teal-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            اختر الكورس المطلوب *
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:bg-[#091D20] dark:border-teal-500/30"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.price} ج.م)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            عدد الأكواد المطلوب توليدها
          </label>
          <input
            type="number"
            min="1"
            max="500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs dark:bg-[#091D20] dark:border-teal-500/30 text-left"
            dir="ltr"
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating || !selectedCourseId}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs font-bold shadow hover:bg-bio-deep disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isGenerating ? 'جارٍ التوليد في الداتابيز...' : 'توليد وحفظ الأكواد ⚡'}</span>
        </button>
      </form>

      {/* Codes Table with Excel Export */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-teal-300">
            أحدث الأكواد المولدة ({codes.length} كود)
          </span>

          <button
            type="button"
            onClick={exportCodesToExcel}
            disabled={codes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>تصدير Excel (UTF-8 BOM CSV)</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-xs text-slate-400">جارٍ جلب الأكواد...</div>
        ) : codes.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">لم يتم توليد أي أكواد بعد</div>
        ) : (
          <div className="overflow-x-auto max-h-80 border rounded-xl dark:border-teal-500/20">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-[#071719] text-slate-600 dark:text-teal-300 sticky top-0 border-b">
                <tr>
                  <th className="p-2.5">الكود السري</th>
                  <th className="p-2.5">الكورس</th>
                  <th className="p-2.5">السعر</th>
                  <th className="p-2.5">الحالة</th>
                  <th className="p-2.5">تاريخ التوليد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10">
                {codes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-[#071719]/40 font-mono">
                    <td className="p-2.5 font-bold text-bio-teal dark:text-emerald-400 select-all">{c.code}</td>
                    <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-white">{c.course_title}</td>
                    <td className="p-2.5 font-sans">{c.price_amount} ج.م</td>
                    <td className="p-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.is_used ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {c.is_used ? 'مستخدم' : 'متاح للتفعيل'}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans text-slate-400">{c.created_at.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
