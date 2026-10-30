'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Phone, LogIn, AlertCircle, HelpCircle, Shield, X, MessageSquare } from 'lucide-react';
import { normalizePhoneNumber, sanitizePhoneInput } from '@/lib/utils/input-normalizer';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  useEffect(() => {
    const savedLockout = localStorage.getItem('lms_login_lockout_until');
    if (savedLockout && Number(savedLockout) > Date.now()) {
      setLockoutUntil(Number(savedLockout));
    }
  }, []);

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

    // Simulate login logic
    setTimeout(() => {
      // Demo test password check
      if (password === 'wrong-demo') {
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

      // Successful login
      localStorage.setItem('lms_preview_auth_user', JSON.stringify({
        fullName: 'طالب منصة عمار رزق',
        phone: cleanPhone,
        role: 'student',
        enrolledCourses: ['c-1', 'c-bundle-2027'],
      }));
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div dir="rtl" className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/85 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-bio-teal/20 text-gold shadow-inner">
          <LogIn className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-white">تسجيل الدخول 🧬</h1>
        <p className="mt-1 text-sm text-slate-300">مرحباً بك مجدداً في منصة الأحياء</p>
      </div>

      {isLocked && (
        <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm font-bold text-rose-300">
          ⚠️ الحساب مقفل مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار {remainingSeconds} ثانية.
        </div>
      )}

      {errorMsg && !isLocked && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-200">رقم الهاتف المسجل *</label>
          <div className="relative">
            <input
              type="tel"
              dir="ltr"
              disabled={isLocked}
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              placeholder="010XXXXXXXX"
              className="w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 text-base text-white placeholder-slate-500 text-left focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
            />
            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200">كلمة السر *</label>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs font-medium text-gold hover:underline"
            >
              نسيت كلمة السر؟
            </button>
          </div>
          <div className="relative">
            <input
              type="password"
              disabled={isLocked}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold disabled:opacity-50"
            />
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Cloudflare Turnstile Simulation Widget */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="turnstile"
              checked={isTurnstileVerified}
              onChange={(e) => setIsTurnstileVerified(e.target.checked)}
              className="h-4 w-4 rounded accent-bio-teal"
            />
            <label htmlFor="turnstile" className="cursor-pointer select-none">
              أنا لست برنامج روبوت (حماية كلاود فلير)
            </label>
          </div>
          <Shield className="h-4 w-4 text-emerald-400" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLocked || !isTurnstileVerified}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3.5 text-base font-bold text-slate-950 transition hover:bg-gold-dark active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'جارٍ التحقق...' : 'دخول المنصة 🚀'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        طالب جديد؟{' '}
        <Link prefetch={false} href="/register" className="font-bold text-gold hover:underline">
          إنشاء حساب جديد هنا
        </Link>
      </p>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-slate-900 p-6 text-right text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-gold">
                <HelpCircle className="h-5 w-5" />
                استعادة وتغيير كلمة السر
              </h3>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                🔒 <strong>إذا نسيت كلمة السر وأنت خارج المنصة:</strong>
                <br />
                يتم استعادة كلمة السر حصرياً عبر التواصل المباشر مع <strong>الدعم الفني عبر واتساب</strong>، حيث يتأكد الأدمن من هويتك ورقم ولي الأمر المسجل ويقوم بإعادة تعيينها لك فوراً من لوحة التحكم.
              </p>
              <p className="text-xs text-slate-400">
                💡 <strong>ملاحظة للطلاب المسجلين:</strong> إذا كان حسابك مفتوحاً، يمكنك تغيير كلمة السر بنفسك مباشرة في أي وقت من تاب <em>"الأمان"</em> داخل صفحة <em>"حسابي"</em>.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="https://wa.me/201000000000?text=مرحباً، أريد المساعدة في استعادة كلمة السر لحسابي في منصة مستر عمار رزق"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
              >
                <MessageSquare className="h-4 w-4" />
                <span>تواصل مع الدعم الفني عبر واتساب</span>
              </a>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
