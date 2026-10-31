'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Phone, ShieldCheck, AlertCircle, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { normalizePhoneNumber, sanitizePhoneInput, normalizeDigits } from '@/lib/utils/input-normalizer';
import { createClient } from '@/lib/supabase/client';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

export function AdminLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const savedLockout = localStorage.getItem('lms_admin_login_lockout_until');
    if (savedLockout && Number(savedLockout) > Date.now()) {
      setLockoutUntil(Number(savedLockout));
    }
  }, []);

  useEffect(() => {
    if (!lockoutUntil || lockoutUntil <= Date.now()) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null);
        localStorage.removeItem('lms_admin_login_lockout_until');
      } else {
        setTick((t) => t + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const isLocked = lockoutUntil !== null && lockoutUntil > Date.now();
  const remainingSeconds = isLocked ? Math.ceil((lockoutUntil! - Date.now()) / 1000) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const cleanPhone = normalizePhoneNumber(phone);
    if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
      setErrorMsg('الرجاء إدخال رقم هاتف مصري صحيح مكون من 11 رقماً');
      return;
    }
    if (!password) {
      setErrorMsg('الرجاء كتابة كلمة السر');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const supabase = createClient();
      let candidateEmails: string[] = [];
      try {
        const { data: resEmail, error: rpcErr } = await supabase.rpc('get_staff_auth_email', { p_phone: cleanPhone });
        if (!rpcErr && resEmail) candidateEmails = [resEmail];
      } catch {
        // Fallback to candidates
      }

      if (candidateEmails.length === 0) {
        candidateEmails = [
          `${cleanPhone}@student.platform.local`,
          `${cleanPhone}@teacher.platform.local`,
          `${cleanPhone}@staff.platform.local`,
        ];
      }

      let signedInUser = null;
      let lastError: { status?: number; code?: string; message?: string } | null = null;

      for (const email of candidateEmails) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          signedInUser = data.user;
          break;
        }
        lastError = error;
        if (error?.status === 429 || error?.code === 'over_request_rate_limit' || error?.message?.toLowerCase().includes('rate limit')) {
          break;
        }
      }

      if (!signedInUser) {
        const isRateLimit =
          lastError?.status === 429 ||
          lastError?.code === 'over_request_rate_limit' ||
          lastError?.message?.toLowerCase().includes('rate limit');
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (isRateLimit || nextAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_DURATION_MS;
          setLockoutUntil(lockTime);
          localStorage.setItem('lms_admin_login_lockout_until', String(lockTime));
          setErrorMsg(
            isRateLimit
              ? 'تم حظر المحاولات مؤقتاً (Rate Limit) لحماية الحساب لكثرة الطلبات. يرجى الانتظار 5 دقائق.'
              : 'تم قفل محاولات تسجيل الدخول لمدة 5 دقائق بعد 5 محاولات خاطئة لحماية لوحة التحكم'
          );
        } else {
          setErrorMsg(`بيانات الدخول غير صحيحة. متبقي ${MAX_FAILED_ATTEMPTS - nextAttempts} محاولات`);
        }
        setIsSubmitting(false);
        return;
      }

      const role = signedInUser.app_metadata?.role || signedInUser.user_metadata?.role;
      if (!role || !['super_admin', 'admin', 'assistant'].includes(role)) {
        await supabase.auth.signOut();
        setErrorMsg('عفواً، هذا الحساب ليس لديه صلاحية الدخول للوحة التحكم');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('lms_admin_auth_user', JSON.stringify({
        id: signedInUser.id,
        phone: cleanPhone,
        role,
        permissions: signedInUser.app_metadata?.permissions || {},
        fullName: signedInUser.user_metadata?.full_name || 'الكادر التعليمي',
      }));

      // Full document navigation ensures all cookies are committed and prevents Next.js router cache stall
      if (typeof window !== 'undefined') {
        window.location.replace('/admin');
      } else {
        router.push('/admin');
      }

      // Safety timeout in case browser delays navigation
      setTimeout(() => {
        setIsSubmitting(false);
      }, 7000);
    } catch {
      setErrorMsg('حدث خطأ في الاتصال بالسيرفر');
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-slate-900 shadow-xl dark:border-teal-500/25 dark:bg-[#0D2628] dark:text-white transition-colors">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-600 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-inner">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">لوحة تحكم الكادر التعليمي 👨‍🏫</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          تسجيل دخول المدرس والمساعدين لإدارة المنصة
        </p>
      </div>

      {isLocked && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-300">
          ⚠️ تم قفل محاولات الدخول مؤقتاً لحماية لوحة التحكم. يرجى الانتظار {remainingSeconds} ثانية.
        </div>
      )}

      {errorMsg && !isLocked && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="admin-phone" className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            رقم الهاتف المعتمد *
          </label>
          <div className="relative">
            <input
              id="admin-phone"
              type="tel"
              inputMode="numeric"
              dir="ltr"
              disabled={isLocked}
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              placeholder="012XXXXXXXX"
              className="w-full rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 text-left focus:border-bio-teal focus:outline-none focus:ring-1 focus:ring-bio-teal disabled:opacity-50 dark:border-teal-500/30 dark:bg-[#071719] dark:text-white dark:placeholder-slate-400"
            />
            <Phone className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            كلمة السر *
          </label>
          <div className="relative">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              disabled={isLocked}
              value={password}
              onChange={(e) => setPassword(normalizeDigits(e.target.value))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 text-left focus:border-bio-teal focus:outline-none focus:ring-1 focus:ring-bio-teal disabled:opacity-50 dark:border-teal-500/30 dark:bg-[#071719] dark:text-white dark:placeholder-slate-400"
            />
            <Lock className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLocked}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-bio-teal dark:bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{isSubmitting ? 'جارٍ التحقق...' : 'دخول لوحة التحكم 🚀'}</span>
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500 dark:border-teal-500/20 dark:text-slate-400">
        هل أنت طالب؟{' '}
        <Link prefetch={false} href="/login" className="font-bold text-bio-teal hover:underline dark:text-emerald-400">
          تسجيل دخول الطلاب من هنا
        </Link>
      </div>
    </div>
  );
}
