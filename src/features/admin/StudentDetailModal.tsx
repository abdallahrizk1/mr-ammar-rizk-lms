'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Unlock, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { resetStudentPasswordAction } from '@/app/actions/admin-actions';
import type { AdminStudentProfile } from './StudentManager';

interface StudentDetailModalProps {
  student: AdminStudentProfile;
  onClose: () => void;
  onRefresh: () => void;
}

export function StudentDetailModal({ student, onClose, onRefresh }: StudentDetailModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [selectedLessonToUnlock, setSelectedLessonToUnlock] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      const sb = createClient();
      const { data } = await sb.from('lessons').select('id, title').is('deleted_at', null).limit(50);
      if (data) setLessons(data);
    };
    fetchLessons();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return;
    setIsResetting(true);
    const res = await resetStudentPasswordAction(student.id, newPassword);
    if (res.success) {
      setResetSuccess(true);
      setNewPassword('');
    }
    setIsResetting(false);
  };

  const handleManualUnlock = async () => {
    if (!selectedLessonToUnlock) return;
    setIsUnlocking(true);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      await sb.from('manual_lesson_unlocks').insert({
        student_id: student.id,
        lesson_id: selectedLessonToUnlock,
        unlocked_by: user?.id,
        reason: 'فتح استثنائي من لوحة التحكم',
      });
      setUnlockSuccess(true);
    } catch {}
    setIsUnlocking(false);
  };

  const handleOpenParentWhatsApp = () => {
    const cleanParentPhone = student.parent_phone.replace(/\D/g, '');
    const phoneWithCountry = cleanParentPhone.startsWith('2') ? cleanParentPhone : `2${cleanParentPhone}`;
    const reportMessage = `السلام عليكم ورحمة الله وبركاته،
تحية طيبة لولي أمر الطالب/ة: *${student.full_name}* 🧬
من منصة مستر عمار رزق للأحياء (الثانوية العامة).

يسرنا إحاطة سيادتكم بتقرير المتابعة والالتزام:
📌 الصف الدراسي: الصف ${student.grade_level} (${student.education_type === 'general' ? 'عام' : 'أزهر'})
📌 المحافظة: ${student.governorate}
📌 حالة الحساب: ${student.is_verified_by_admin ? 'معتمد وموثق ✅' : 'قيد التدقيق ⏳'}
📌 التزام الامتحانات والواجبات: مستمر في المتابعة الدورية.

نحن دائماً في خدمتكم لدعم تفوق أبنائنا. بالتوفيق والنجاح الدائم! 🌟`;

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(reportMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 text-slate-900 shadow-2xl dark:border-teal-500/30 dark:bg-[#0D2628] dark:text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 dark:border-teal-500/20">
          <div>
            <h3 className="text-base font-bold text-bio-teal dark:text-emerald-400">
              ملف الطالب: {student.full_name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">رقم الهاتف: {student.phone}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 space-y-4 text-xs">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#071719] p-3 rounded-xl border border-slate-100 dark:border-teal-500/10">
            <div><strong>رقم ولي الأمر:</strong> {student.parent_phone}</div>
            <div><strong>المحافظة:</strong> {student.governorate}</div>
            <div><strong>الصف:</strong> الصف {student.grade_level}</div>
            <div><strong>النوع:</strong> {student.education_type}</div>
          </div>

          {/* WhatsApp Parent Follow-up Button */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <div className="font-bold text-emerald-800 dark:text-emerald-300">متابعة ولي الأمر عبر واتساب 📲</div>
            <p className="text-slate-600 dark:text-slate-300">فتح محادثة واتساب فورية مع ولي الأمر برسالة تقرير مجهزة مسبقاً</p>
            <button
              type="button"
              onClick={handleOpenParentWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow"
            >
              <MessageSquare className="h-4 w-4" />
              <span>إرسال تقرير المتابعة لولي الأمر على واتساب</span>
            </button>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleResetPassword} className="p-3 rounded-xl border space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Key className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
              <span>تغيير كلمة سر الطالب (في حال نسيانها)</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة السر الجديدة (6 خانات+)..."
                className="flex-1 p-2 rounded-xl border dark:bg-[#071719] text-xs"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={isResetting || newPassword.length < 6}
                className="px-3 py-2 bg-bio-teal text-white rounded-xl font-bold disabled:opacity-50"
              >
                {isResetting ? 'جارٍ...' : 'تحديث'}
              </button>
            </div>
            {resetSuccess && <p className="text-emerald-600 font-bold">تم تحديث كلمة سر الطالب بنجاح!</p>}
          </form>

          {/* Manual Lecture Unlock */}
          <div className="p-3 rounded-xl border space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Unlock className="h-4 w-4 text-amber-500" />
              <span>فتح استثنائي لمحاضرة معينة (Manual Unlock)</span>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedLessonToUnlock}
                onChange={(e) => setSelectedLessonToUnlock(e.target.value)}
                className="flex-1 p-2 rounded-xl border dark:bg-[#071719] text-xs"
              >
                <option value="">اختر المحاضرة لفتحها للطالب...</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleManualUnlock}
                disabled={isUnlocking || !selectedLessonToUnlock}
                className="px-3 py-2 bg-amber-600 text-white rounded-xl font-bold disabled:opacity-50"
              >
                {isUnlocking ? 'جارٍ...' : 'فتح الآن'}
              </button>
            </div>
            {unlockSuccess && <p className="text-emerald-600 font-bold">تم فتح المحاضرة استثنائياً لهذا الطالب!</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 dark:border-teal-500/20"
        >
          إغلاق النافذة
        </button>
      </div>
    </div>
  );
}
