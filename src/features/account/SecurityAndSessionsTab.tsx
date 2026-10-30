'use client';

import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  Laptop,
  Lock,
  CheckCircle2,
  AlertTriangle,
  History,
  KeyRound,
} from 'lucide-react';
import { LoginSessionItem } from '@/lib/data/student-profile-data';
import { normalizeDigits } from '@/lib/utils/input-normalizer';

interface SecurityAndSessionsTabProps {
  sessions: LoginSessionItem[];
  logoutsToday: number;
  logoutsThisWeek: number;
}

export function SecurityAndSessionsTab({
  sessions,
  logoutsToday,
  logoutsThisWeek,
}: SecurityAndSessionsTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setStatusMsg({ type: 'error', text: 'يرجى إدخال كلمة السر الحالية' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'كلمة السر الجديدة يجب أن تكون 6 خانات على الأقل' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'كلمة السر وتأكيدها غير متطابقين' });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatusMsg({ type: 'success', text: 'تم تحديث كلمة السر بنجاح ✅' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* 1. Top Stat Cards: Logout stats (Display only, without locking account) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              مرات تسجيل الخروج اليوم
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#071719] text-slate-600 dark:text-slate-300">
              <History className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {logoutsToday} <span className="text-xs font-normal text-slate-400">مرات خلال 24 ساعة</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-teal-300/60">
            للعرض والإحصاء فقط بدون حظر الحساب
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              مرات تسجيل الخروج هذا الأسبوع
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#071719] text-slate-600 dark:text-slate-300">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {logoutsThisWeek} <span className="text-xs font-normal text-slate-400">مرات خلال آخر 7 أيام</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-teal-300/60">
            سجل حركة الدخول والخروج المنتظمة لحسابك
          </p>
        </div>
      </div>

      {/* 2. Login Sessions & Devices Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
          <span>جلسات وأجهزة تسجيل الدخول</span>
        </h2>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-teal-500/20 text-slate-400 dark:text-teal-300/60 text-[11px]">
                <th className="py-2 px-2.5 font-bold">الجهاز</th>
                <th className="py-2 px-2.5 font-bold">اسم الجهاز</th>
                <th className="py-2 px-2.5 font-bold">نظام التشغيل</th>
                <th className="py-2 px-2.5 font-bold">المتصفح</th>
                <th className="py-2 px-2.5 font-bold">آخر نشاط</th>
                <th className="py-2 px-2.5 font-bold">تاريخ الدخول</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-teal-500/10">
              {sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-50 dark:hover:bg-[#071719] transition">
                  <td className="py-2.5 px-2.5">
                    {sess.deviceType === 'mobile' ? (
                      <div className="flex items-center gap-1.5 text-bio-teal dark:text-emerald-400">
                        <Smartphone className="h-4 w-4" />
                        <span>موبايل</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Laptop className="h-4 w-4" />
                        <span>كمبيوتر</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 font-semibold text-slate-900 dark:text-white">
                    {sess.deviceName}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-600 dark:text-slate-300">
                    {sess.os}
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-600 dark:text-slate-300">
                    {sess.browser}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {sess.lastActive}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-slate-500 dark:text-teal-300/60 text-[11px]">
                    {sess.loginDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Change Password Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
          <span>تغيير كلمة السر</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-teal-200/60 mb-3">
          قم بتحديث كلمة المرور الخاصة بحسابك مع اختيار كلمة سر قوية
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-3 max-w-md">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              كلمة السر الحالية
            </label>
            <input
              type="password"
              dir="ltr"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(normalizeDigits(e.target.value))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-base sm:text-sm text-left text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#071719] dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              كلمة السر الجديدة (6 خانات على الأقل)
            </label>
            <input
              type="password"
              dir="ltr"
              value={newPassword}
              onChange={(e) => setNewPassword(normalizeDigits(e.target.value))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-base sm:text-sm text-left text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#071719] dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              تأكيد كلمة السر الجديدة
            </label>
            <input
              type="password"
              dir="ltr"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(normalizeDigits(e.target.value))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-base sm:text-sm text-left text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#071719] dark:text-white"
            />
          </div>

          {statusMsg && (
            <div
              className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
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
