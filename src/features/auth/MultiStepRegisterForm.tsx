'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, User, School, Lock } from 'lucide-react';
import { normalizePhoneNumber, phoneToVirtualEmail, sanitizePhoneInput } from '@/lib/utils/input-normalizer';
import { HIGH_SCHOOL_GRADES, EDUCATION_TYPES, EGYPTIAN_GOVERNORATES, type FullRegisterInput } from './types';

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
    const virtualEmail = phoneToVirtualEmail(formData.phone);

    setTimeout(() => {
      localStorage.setItem('lms_preview_auth_user', JSON.stringify({
        fullName: formData.fullName,
        phone: formData.phone,
        virtualEmail,
        gradeId: formData.gradeId,
        reviewStatus: 'pending_review',
      }));
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 700);
  };

  if (isSuccess) {
    return (
      <div dir="rtl" className="mx-auto max-w-lg rounded-3xl border border-emerald-500/30 bg-white p-8 text-center text-slate-900 shadow-2xl dark:bg-slate-900/90 dark:text-white transition-colors">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">تم إنشاء حسابك بنجاح! 🎉</h2>
        <div className="my-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
          ⚡ <strong>تنبيه مراجعة الحساب:</strong> تم فتح حسابك للدخول مبدئياً فوراً. سيتم مراجعة والتأكد من بياناتك وبيانات ولي الأمر خلال 24 إلى 48 ساعة.
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">أهلاً بك يا <strong>{formData.fullName}</strong> في رحلة التفوق مع مستر عمار رزق!</p>
        <Link prefetch={false} href="/dashboard" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bio-teal py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-bio-deep active:scale-95">
          الانتقال إلى لوحة الطالب الرئيسية 🚀
        </Link>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none focus:ring-1 focus:ring-bio-teal dark:border-white/15 dark:bg-slate-800/80 dark:text-white dark:placeholder-slate-500";

  return (
    <div dir="rtl" className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 text-slate-900 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80 dark:text-white transition-colors">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-bio-teal dark:text-gold">انضم لدفعة 2027 🧬</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">سجل حسابك في منصة مستر عمار رزق للأحياء</p>
      </div>

      <div className="mb-8 flex items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
        {[
          { num: 1, label: 'البيانات الشخصية', icon: User },
          { num: 2, label: 'البيانات الدراسية', icon: School },
          { num: 3, label: 'تأمين الحساب', icon: Lock },
        ].map((item) => (
          <div key={item.num} className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${step >= item.num ? 'text-bio-teal dark:text-gold' : 'text-slate-400 dark:text-slate-500'}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step === item.num ? 'bg-bio-teal text-white dark:bg-gold dark:text-slate-950 font-black' : step > item.num ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {item.num}
            </span>
            <span className="hidden sm:inline">{item.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">الاسم الثلاثي أو الرباعي للطالب *</label>
              <input type="text" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="مثال: أحمد محمد علي" className={inputClass} />
              {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">رقم هاتف الطالب (واتساب) *</label>
              <input type="tel" dir="ltr" value={formData.phone} onChange={(e) => updateField('phone', sanitizePhoneInput(e.target.value))} placeholder="010XXXXXXXX" className={`${inputClass} text-left`} />
              {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
            </div>
            <button type="button" onClick={handleNext} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-bio-teal py-3 text-base font-bold text-white shadow-md transition hover:bg-bio-deep active:scale-95">
              <span>المتابعة للبيانات الدراسية</span>
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">الصف الدراسي *</label>
                <select value={formData.gradeId} onChange={(e) => updateField('gradeId', e.target.value)} className={inputClass}>
                  {HIGH_SCHOOL_GRADES.map((g) => <option key={g.value} value={g.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">نوع التعليم *</label>
                <select value={formData.educationType} onChange={(e) => updateField('educationType', e.target.value)} className={inputClass}>
                  {EDUCATION_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">المحافظة *</label>
                <select value={formData.governorate} onChange={(e) => updateField('governorate', e.target.value)} className={inputClass}>
                  {EGYPTIAN_GOVERNORATES.map((gov) => <option key={gov} value={gov} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{gov}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">النوع *</label>
                <select value={formData.gender} onChange={(e) => updateField('gender', e.target.value)} className={inputClass}>
                  <option value="male" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ذكر</option>
                  <option value="female" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">أنثى</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">رقم هاتف ولي الأمر (ممنوع تطابقه مع الطالب) *</label>
              <input type="tel" dir="ltr" value={formData.parentPhone} onChange={(e) => updateField('parentPhone', sanitizePhoneInput(e.target.value))} placeholder="01XXXXXXXXX" className={`${inputClass} text-left`} />
              {errors.parentPhone && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.parentPhone}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-white/20 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                <ArrowRight className="h-4 w-4" />
                <span>رجوع</span>
              </button>
              <button type="button" onClick={handleNext} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bio-teal py-3 text-base font-bold text-white shadow-md transition hover:bg-bio-deep active:scale-95">
                <span>المتابعة لكلمة السر</span>
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">كلمة السر (6 خانات على الأقل) *</label>
              <input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="••••••••" className={inputClass} />
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">تأكيد كلمة السر *</label>
              <input type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="••••••••" className={inputClass} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)} className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-white/20 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                <ArrowRight className="h-4 w-4" />
                <span>رجوع</span>
              </button>
              <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-bio-teal py-3.5 text-base font-black text-white shadow-xl transition hover:bg-bio-deep active:scale-95 disabled:opacity-50">
                <ShieldCheck className="h-5 w-5" />
                <span>{isSubmitting ? 'جارٍ إنشاء الحساب...' : 'تأكيد وإنشاء الحساب 🎉'}</span>
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        لديك حساب بالفعل؟{' '}
        <Link prefetch={false} href="/login" className="font-bold text-bio-teal hover:underline dark:text-gold">
          تسجيل الدخول هنا
        </Link>
      </p>
    </div>
  );
}
