'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { normalizeDigits, normalizePhoneNumber, sanitizePhoneInput } from '@/lib/utils/input-normalizer';
import { createClient } from '@/lib/supabase/client';
import { registerStudentAction } from '@/app/actions/auth-actions';
import { HIGH_SCHOOL_GRADES, EDUCATION_TYPES, EGYPTIAN_GOVERNORATES, type FullRegisterInput } from './types';
import { RegisterSuccessCard } from './RegisterSuccessCard';
import { RegisterStepIndicator } from './RegisterStepIndicator';

export function MultiStepRegisterForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<FullRegisterInput>({
    fullName: '',
    phone: '',
    gradeId: '3',
    educationType: 'general',
    governorate: 'القاهرة',
    gender: 'male',
    parentPhone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const updateField = (field: keyof FullRegisterInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'الاسم يجب ألا يقل عن 3 أحرف';
    }
    const cleanPhone = normalizePhoneNumber(formData.phone);
    if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
      errs.phone = 'رقم هاتف الطالب غير صحيح (11 رقماً)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    const cleanParentPhone = normalizePhoneNumber(formData.parentPhone);
    const cleanStudentPhone = normalizePhoneNumber(formData.phone);
    if (!/^01[0125]\d{8}$/.test(cleanParentPhone)) {
      errs.parentPhone = 'رقم ولي الأمر غير صحيح (11 رقماً)';
    } else if (cleanParentPhone === cleanStudentPhone) {
      errs.parentPhone = 'ممنوع تطابق رقم ولي الأمر مع رقم الطالب!';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setErrors({ password: 'كلمة السر يجب ألا تقل عن 6 خانات' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'كلمتا السر غير متطابقتين' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    const res = await registerStudentAction({
      fullName: formData.fullName,
      phone: formData.phone,
      parentPhone: formData.parentPhone,
      gradeId: formData.gradeId,
      educationType: formData.educationType,
      governorate: formData.governorate,
      gender: formData.gender,
      password: formData.password,
    });

    if (!res.success) {
      setErrors({ submit: res.error || 'حدث خطأ أثناء إنشاء الحساب' });
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      await supabase.auth.signInWithPassword({
        email: res.virtualEmail!,
        password: formData.password,
      });
    } catch {
      // Ignored if session handled by action
    }

    localStorage.setItem('lms_preview_auth_user', JSON.stringify({
      fullName: formData.fullName,
      phone: formData.phone,
      virtualEmail: res.virtualEmail,
      gradeId: formData.gradeId,
      reviewStatus: 'pending_review',
    }));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return <RegisterSuccessCard fullName={formData.fullName} />;
  }

  const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none focus:ring-1 focus:ring-bio-teal dark:border-teal-500/30 dark:bg-[#071719] dark:text-white dark:placeholder-slate-400 dark:focus:border-emerald-400 dark:focus:ring-1 dark:focus:ring-emerald-400/40";

  return (
    <div dir="rtl" className="mx-auto w-full max-w-md sm:max-w-lg rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 text-slate-900 shadow-lg dark:border-teal-500/25 dark:bg-[#0D2628] dark:shadow-2xl dark:shadow-black/50 dark:text-white transition-colors">
      <div className="mb-3 text-center">
        <h1 className="text-lg sm:text-xl font-black text-bio-teal dark:text-emerald-400">انضم لدفعة 2027 🧬</h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-teal-200/70">سجل حسابك في منصة مستر عمار رزق للأحياء</p>
      </div>

      {errors.submit && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.submit}</span>
        </div>
      )}

      <RegisterStepIndicator step={step} />

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">الاسم الثلاثي أو الرباعي للطالب *</label>
              <input type="text" autoComplete="name" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="مثال: أحمد محمد علي" className={inputClass} />
              {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">رقم هاتف الطالب (واتساب) *</label>
              <input type="tel" inputMode="numeric" autoComplete="tel" dir="ltr" value={formData.phone} onChange={(e) => updateField('phone', sanitizePhoneInput(e.target.value))} placeholder="010XXXXXXXX" className={`${inputClass} text-left`} />
              {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
            </div>
            <button type="button" onClick={handleNext} className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-bio-teal dark:bg-emerald-600 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95">
              <span>المتابعة للبيانات الدراسية</span>
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">الصف الدراسي *</label>
                <select value={formData.gradeId} onChange={(e) => updateField('gradeId', e.target.value)} className={inputClass}>
                  {HIGH_SCHOOL_GRADES.map((g) => <option key={g.value} value={g.value} className="bg-white dark:bg-[#071719] text-slate-900 dark:text-white">{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">نوع التعليم *</label>
                <select value={formData.educationType} onChange={(e) => updateField('educationType', e.target.value)} className={inputClass}>
                  {EDUCATION_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-white dark:bg-[#071719] text-slate-900 dark:text-white">{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">المحافظة *</label>
                <select value={formData.governorate} onChange={(e) => updateField('governorate', e.target.value)} className={inputClass}>
                  {EGYPTIAN_GOVERNORATES.map((gov) => <option key={gov} value={gov} className="bg-white dark:bg-[#071719] text-slate-900 dark:text-white">{gov}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">النوع *</label>
                <select value={formData.gender} onChange={(e) => updateField('gender', e.target.value)} className={inputClass}>
                  <option value="male" className="bg-white dark:bg-[#071719] text-slate-900 dark:text-white">ذكر</option>
                  <option value="female" className="bg-white dark:bg-[#071719] text-slate-900 dark:text-white">أنثى</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">رقم هاتف ولي الأمر (ممنوع تطابقه مع الطالب) *</label>
              <input type="tel" inputMode="numeric" dir="ltr" value={formData.parentPhone} onChange={(e) => updateField('parentPhone', sanitizePhoneInput(e.target.value))} placeholder="01XXXXXXXXX" className={`${inputClass} text-left`} />
              {errors.parentPhone && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.parentPhone}</p>}
            </div>
            <div className="flex gap-2.5 pt-1">
              <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-teal-500/30 dark:bg-[#071719] dark:text-slate-300 dark:hover:bg-teal-950/40">
                <ArrowRight className="h-4 w-4" />
                <span>رجوع</span>
              </button>
              <button type="button" onClick={handleNext} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bio-teal dark:bg-emerald-600 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95">
                <span>المتابعة لكلمة السر</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2.5">
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">كلمة السر (6 خانات على الأقل) *</label>
              <input type="password" dir="ltr" autoComplete="new-password" value={formData.password} onChange={(e) => updateField('password', normalizeDigits(e.target.value))} placeholder="••••••••" className={`${inputClass} text-left`} />
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">تأكيد كلمة السر *</label>
              <input type="password" dir="ltr" autoComplete="new-password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', normalizeDigits(e.target.value))} placeholder="••••••••" className={`${inputClass} text-left`} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>}
            </div>
            <div className="flex gap-2.5 pt-1">
              <button type="button" onClick={() => setStep(2)} className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-teal-500/30 dark:bg-[#071719] dark:text-slate-300 dark:hover:bg-teal-950/40">
                <ArrowRight className="h-4 w-4" />
                <span>رجوع</span>
              </button>
              <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bio-teal dark:bg-emerald-600 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-white shadow-sm transition hover:bg-bio-deep dark:hover:bg-emerald-500 active:scale-95 disabled:opacity-50">
                <ShieldCheck className="h-4 w-4" />
                <span>{isSubmitting ? 'جارٍ إنشاء الحساب...' : 'تأكيد وإنشاء الحساب 🎉'}</span>
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-3.5 text-center text-xs text-slate-500 dark:text-slate-400">
        لديك حساب بالفعل؟{' '}
        <Link prefetch={false} href="/login" className="font-bold text-bio-teal hover:underline dark:text-emerald-400">
          تسجيل الدخول هنا
        </Link>
      </p>
    </div>
  );
}
