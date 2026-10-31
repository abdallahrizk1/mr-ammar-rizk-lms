'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, CheckCircle2, XCircle, RefreshCw, MessageSquare, ShieldCheck, GraduationCap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { StudentDetailModal } from './StudentDetailModal';

export interface AdminStudentProfile {
  id: string;
  full_name: string;
  phone: string;
  parent_phone: string;
  grade_level: string;
  education_type: string;
  governorate: string;
  review_status: string;
  is_verified_by_admin: boolean;
  instant_activation_banned: boolean;
  created_at: string;
}

export function StudentManager() {
  const [students, setStudents] = useState<AdminStudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentProfile | null>(null);

  // Debounce 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (debouncedQuery) {
        query = query.or(`full_name.ilike.%${debouncedQuery}%,phone.ilike.%${debouncedQuery}%,parent_phone.ilike.%${debouncedQuery}%`);
      }

      const { data } = await query.limit(100);
      if (data) setStudents(data);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [debouncedQuery]);

  const toggleVerification = async (studentId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified_by_admin: !currentStatus })
        .eq('id', studentId);

      if (!error) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, is_verified_by_admin: !currentStatus } : s))
        );
      }
    } catch {}
  };

  const exportStudentsToExcel = () => {
    if (students.length === 0) return;
    const bom = '\uFEFF';
    let csv = `${bom}اسم الطالب,رقم هاتف الطالب,رقم ولي الأمر,الصف,نوع التعليم,المحافظة,حالة التوثيق,تاريخ التسجيل\n`;

    students.forEach((s) => {
      const verified = s.is_verified_by_admin ? 'موثق ومعتمد' : 'بانتظار المراجعة';
      const cleanName = `"${s.full_name.replace(/"/g, '""')}"`;
      csv += `${cleanName},${s.phone},${s.parent_phone},الصف ${s.grade_level},${s.education_type},${s.governorate},${verified},${s.created_at.split('T')[0]}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كشف_طلاب_منصة_عمار_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-4" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
            <span>شؤون الطلاب ومتابعة ولي الأمر</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            بحث فوري (500ms)، كشوفات الدرجات، تقرير واتساب لولي الأمر، وتوثيق الحسابات
          </p>
        </div>

        <button
          type="button"
          onClick={exportStudentsToExcel}
          disabled={students.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 transition disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          <span>تصدير كشف الطلاب (Excel CSV)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم الطالب، رقم هاتف الطالب، أو رقم ولي الأمر..."
          className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:bg-[#071719] dark:border-teal-500/30 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-bio-teal"
        />
        <Search className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      {/* Students Table */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">جارٍ البحث وجلب الطلاب...</div>
      ) : students.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">لا يوجد طلاب مطابقين للبحث</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-[#071719] text-slate-600 dark:text-teal-300 border-b">
              <tr>
                <th className="p-2.5">اسم الطالب</th>
                <th className="p-2.5">رقم الطالب</th>
                <th className="p-2.5">رقم ولي الأمر</th>
                <th className="p-2.5">الصف / النوع</th>
                <th className="p-2.5">التوثيق</th>
                <th className="p-2.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-[#071719]/40">
                  <td className="p-2.5 font-bold text-slate-900 dark:text-white">{s.full_name}</td>
                  <td className="p-2.5 font-mono dir-ltr text-right">{s.phone}</td>
                  <td className="p-2.5 font-mono dir-ltr text-right">{s.parent_phone}</td>
                  <td className="p-2.5 text-slate-500">
                    الصف {s.grade_level} ({s.education_type === 'general' ? 'عام' : s.education_type === 'azhar' ? 'أزهر' : 'لغات'})
                  </td>
                  <td className="p-2.5">
                    <button
                      type="button"
                      onClick={() => toggleVerification(s.id, s.is_verified_by_admin)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                        s.is_verified_by_admin
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {s.is_verified_by_admin ? 'موثق ✅' : 'قيد المراجعة ⏳'}
                    </button>
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(s)}
                      className="px-2.5 py-1 rounded-lg bg-bio-teal dark:bg-emerald-600 text-white font-bold hover:bg-bio-deep transition text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>الملف الكامل</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onRefresh={fetchStudents}
        />
      )}
    </div>
  );
}
