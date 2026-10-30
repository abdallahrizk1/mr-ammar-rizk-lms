'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, Lock, CheckCircle2, Phone } from 'lucide-react';
import { normalizeDigits } from '@/lib/utils/input-normalizer';

export default function StudentAccountPage() {
  const [studentName, setStudentName] = useState('طالب منصة عمار رزق');
  const [studentPhone, setStudentPhone] = useState('01012345678');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('lms_preview_auth_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.fullName) setStudentName(parsed.fullName);
        if (parsed.phone) setStudentPhone(parsed.phone);
      } catch {}
    }
  }, []);

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setSavedMsg('يرجى إدخال كلمة سر جديدة لا تقل عن 6 خانات');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setSavedMsg('تم تحديث كلمة السر بنجاح ✅');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-3 sm:space-y-4" dir="rtl">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 flex items-center gap-2">
          <User className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
          <span>حسابي وإعدادات الأمان</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
          بياناتك المسجلة في المنصة وإعدادات حماية الحساب
        </p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-slate-50 dark:bg-[#071719] border border-slate-200/80 dark:border-teal-500/15 p-3">
            <span className="text-[11px] text-slate-400 dark:text-teal-300/60 block">اسم الطالب</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
              {studentName}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-[#071719] border border-slate-200/80 dark:border-teal-500/15 p-3">
            <span className="text-[11px] text-slate-400 dark:text-teal-300/60 block">رقم الهاتف المسجل</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5" dir="ltr">
              <Phone className="h-3.5 w-3.5 text-bio-teal dark:text-emerald-400" />
              {studentPhone}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
          <span>الأمان وتغيير كلمة السر</span>
        </h2>

        <form onSubmit={handlePasswordSave} className="space-y-2.5 max-w-md">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              كلمة السر الحالية
            </label>
            <input
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(normalizeDigits(e.target.value))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-left text-slate-900 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#071719] dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              كلمة السر الجديدة (6 خانات على الأقل)
            </label>
            <input
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(normalizeDigits(e.target.value))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-left text-slate-900 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#071719] dark:text-white"
            />
          </div>

          {savedMsg && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>{savedMsg}</span>
            </p>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-bio-teal dark:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>حفظ كلمة السر الجديدة</span>
          </button>
        </form>
      </div>
    </div>
  );
}
