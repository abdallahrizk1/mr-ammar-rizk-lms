'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Phone, LogIn, AlertCircle, HelpCircle, Shield, X, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { normalizeDigits, normalizePhoneNumber, sanitizePhoneInput, phoneToVirtualEmail } from '@/lib/utils/input-normalizer';
import { createClient } from '@/lib/supabase/client';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const savedLockout = localStorage.getItem('lms_login_lockout_until');
    if (savedLockout && Number(savedLockout) > Date.now()) {
      setLockoutUntil(Number(savedLockout));
    }
  }, []);

  useEffect(() => {
    if (!lockoutUntil || lockoutUntil <= Date.now()) return;
    const timer = setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null);
        localStorage.removeItem('lms_login_lockout_until');
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
      const virtualEmail = phoneToVirtualEmail(cleanPhone);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: virtualEmail,
        password,
      });

      if (error) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_DURATION_MS;
          setLockoutUntil(lockTime);
          localStorage.setItem('lms_login_lockout_until', String(lockTime));
          setErrorMsg('تم قفل محاولات تسجيل الدخول لمدة 5 دقائق بعد 5 محاولات خاطئة');
        } else {
          setErrorMsg(`بيانات الدخول غير صحيحة. متبقي ${MAX_FAILED_ATTEMPTS - nextAttempts} محاولات`);
        }
        setIsSubmitting(false);
        return;
      }

      const userRole = data.user?.app_metadata?.role;
      setIsSubmitting(false);
      if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'assistant') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setErrorMsg('حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً');
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="mx-auto w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 text-slate-900 shadow-md dark:border-teal-500/25 dark:bg-[#0D2628] dark:shadow-2xl dark:shadow-black/50 dark:text-white transition-colors">
      <div className="mb-3.5 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-bio-teal/15 text-bio-teal dark:bg-emerald-500/20 dark:text-emerald-400 shadow-inner">
          <LogIn className="h-5 w-5" />
        </div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">تسجيل الدخول 🧬</h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-teal-200/70">مرحباً بك مجدداً في منصة الأحياء</p>
      </div>

      {isLocked && (
        <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-center text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-300">
          ⚠️ الحساب مقفل مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار {remainingSeconds} ثانية.
        </div>
      )}

      {errorMsg && !isLocked && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="login-phone" className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">رقم الهاتف المسجل *</label>
          <div className="relative">
            <input
              id="login-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              dir="ltr"
              disabled={isLocked}
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              placeholder="010XXXXXXXX"
              className="w-full rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 text-left focus:border-bio-teal focus:outline-none focus:ring-1 focus:ring-bio-teal disabled:opacity-50 dark:border-teal-500/30 dark:bg-[#071719] dark:text-white dark:placeholder-slate-400 dark:focus:border-emerald-400 dark:focus:ring-1 dark:focus:ring-emerald-400/40"
            />
            <Phone className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">كلمة السر *</label>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs font-medium text-bio-teal hover:underline dark:text-emerald-400"
            >
              نسيت كلمة السر؟
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              dir="ltr"
              disabled={isLocked}
              value={password}
              onChange={(e) => setPassword(normalizeDigits(e.target.value))}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 text-left focus:border-bio-teal focus:outline-none focus:ring-1 focus:ring-bio-teal disabled:opacity-50 dark:border-teal-500/30 dark:bg-[#071719] dark:text-white dark:placeholder-slate-400 dark:focus:border-emerald-400 dark:focus:ring-1 dark:focus:ring-emerald-400/40"
            />
            <Lock className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-2 text-xs text-slate-700 dark:border-teal-500/20 dark:bg-[#071719] dark:text-slate-300">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="turnstile" checked={isTurnstileVerified} onChange={(e) => setIsTurnstileVerified(e.target.checked)} className="h-4 w-4 shrink-0 rounded accent-bio-teal" />
            <label htmlFor="turnstile" className="cursor-pointer select-none text-[11px] sm:text-xs leading-snug">أنا لست برنامج روبوت (حماية كلاود فلير)</label>
          </div>
          <Shield className="h-4 w-4 shrink-0 text-emerald-500" />
        </div>

        <button type="submit" disabled={isSubmitting || isLocked || !isTurnstileVerified} className="flex w-full items-center justify-center gap-2 rounded-xl bg-bio-teal dark:bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95 disabled:opacity-50">
          {isSubmitting ? 'جارٍ التحقق...' : 'دخول المنصة 🚀'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        طالب جديد؟{' '}
        <Link prefetch={false} href="/register" className="font-bold text-bio-teal hover:underline dark:text-emerald-400">إنشاء حساب جديد هنا</Link>
      </p>

      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-right text-slate-900 shadow-2xl dark:border-teal-500/30 dark:bg-[#0D2628] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-500/20 pb-2.5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-bio-teal dark:text-emerald-400">
                <HelpCircle className="h-4 w-4" />
                استعادة وتغيير كلمة السر
              </h3>
              <button type="button" onClick={() => setIsForgotModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <p>
                🔒 <strong>إذا نسيت كلمة السر وأنت خارج المنصة:</strong>
                <br />
                يتم استعادة كلمة السر حصرياً عبر التواصل المباشر مع <strong>الدعم الفني عبر واتساب</strong>، حيث يتأكد الأدمن من هويتك ورقم ولي الأمر المسجل ويقوم بإعادة تعيينها لك فوراً من لوحة التحكم.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-teal-300/60">
                💡 <strong>ملاحظة للطلاب المسجلين:</strong> إذا كان حسابك مفتوحاً، يمكنك تغيير كلمة السر بنفسك مباشرة في أي وقت من تاب <em>&quot;الأمان&quot;</em> داخل صفحة <em>&quot;حسابي&quot;</em>.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <a href="https://wa.me/201000000000?text=مرحباً، أريد المساعدة في استعادة كلمة السر لحسابي في منصة مستر عمار رزق" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-emerald-500">
                <MessageSquare className="h-4 w-4" />
                <span>تواصل مع الدعم الفني عبر واتساب</span>
              </a>
              <button type="button" onClick={() => setIsForgotModalOpen(false)} className="rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-teal-500/30 dark:bg-[#071719] dark:text-slate-300 dark:hover:bg-teal-950/40">
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
