'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, User, School, Lock } from 'lucide-react';
import { normalizePhoneNumber, phoneToVirtualEmail, sanitizePhoneInput } from '@/lib/utils/input-normalizer';
import {
  HIGH_SCHOOL_GRADES,
  EDUCATION_TYPES,
  EGYPTIAN_GOVERNORATES,
  type FullRegisterInput,
} from './types';

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
      errs.phone = 'رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015';
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
    // Virtual email generation for Supabase Auth
    const virtualEmail = phoneToVirtualEmail(formData.phone);

    // Simulate registration network call with localStorage mock
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
      <div dir="rtl" className="mx-auto max-w-lg rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 text-center text-white shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-black text-emerald-400">تم إنشاء حسابك بنجاح! 🎉</h2>
        <div className="my-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-200">
          ⚡ <strong>تنبيه مراجعة الحساب:</strong> تم فتح حسابك للدخول مبدئياً فوراً. سيتم مراجعة والتأكد من بياناتك وبيانات ولي الأمر خلال 24 إلى 48 ساعة.
        </div>
        <p className="text-sm text-slate-300">أهلاً بك يا <strong>{formData.fullName}</strong> في رحلة التفوق في مادة الأحياء مع مستر عمار رزق!</p>
        <Link prefetch={false} href="/dashboard" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-bio-teal to-emerald-500 py-3.5 text-base font-bold text-white shadow-lg transition hover:brightness-110 active:scale-95">
          الانتقال إلى لوحة الطالب الرئيسية 🚀
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 text-white shadow-2xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-gold">انضم لدفعة 2027 🧬</h1>
        <p className="mt-1 text-sm text-slate-300">سجل حسابك في منصة مستر عمار رزق للأحياء</p>
      </div>

      {/* Stepper Header */}
      <div className="mb-8 flex items-center justify-between gap-2 border-b border-white/10 pb-4">
        {[
          { num: 1, label: 'البيانات الشخصية', icon: User },
          { num: 2, label: 'البيانات الدراسية', icon: School },
          { num: 3, label: 'تأمين الحساب', icon: Lock },
        ].map((item) => (
          <div key={item.num} className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${step >= item.num ? 'text-gold' : 'text-slate-500'}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${step === item.num ? 'bg-gold text-slate-950 font-black' : step > item.num ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
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
              <label className="mb-1 block text-sm font-semibold text-slate-200">الاسم الثلاثي أو الرباعي للطالب *</label>
              <input type="text" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="مثال: أحمد محمد علي" className="w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
              {errors.fullName && <p className="mt-1 text-xs text-rose-400">{errors.fullName}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-200">رقم هاتف الطالب (واتساب) *</label>
              <input type="tel" dir="ltr" value={formData.phone} onChange={(e) => updateField('phone', sanitizePhoneInput(e.target.value))} placeholder="010XXXXXXXX" className="w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 text-base text-white placeholder-slate-500 text-left focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
              {errors.phone && <p className="mt-1 text-xs text-rose-400">{errors.phone}</p>}
            </div>
            <button type="button" onClick={handleNext} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-base font-bold text-slate-950 transition hover:bg-gold-dark active:scale-95">
              <span>المتابعة للبيانات الدراسية</span>
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">الصف الدراسي *</label>
                <select value={formData.gradeId} onChange={(e) => updateField('gradeId', e.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-base text-white focus:border-gold focus:outline-none">
                  {HIGH_SCHOOL_GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">نوع التعليم *</label>
                <select value={formData.educationType} onChange={(e) => updateField('educationType', e.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-base text-white focus:border-gold focus:outline-none">
                  {EDUCATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">المحافظة *</label>
                <select value={formData.governorate} onChange={(e) => updateField('governorate', e.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-base text-white focus:border-gold focus:outline-none">
                  {EGYPTIAN_GOVERNORATES.map((gov) => <option key={gov} value={gov}>{gov}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-200">النوع *</label>
                <select value={formData.gender} onChange={(e) => updateField('gender', e.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-base text-white focus:border-gold focus:outline-none">
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-200">رقم هاتف ولي الأمر (ممنوع تطابقه مع الطالب) *</label>
              <input type="tel" dir="ltr" value={formData.parentPhone} onChange={(e) => updateField('parentPhone', sanitizePhoneInput(e.target.value))} placeholder="01XXXXXXXXX" className="w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 text-base text-white placeholder-slate-500 text-left focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
              {errors.parentPhone && <p className="mt-1 text-xs text-rose-400 font-bold">{errors.parentPhone}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
                <ArrowRight className="h-4 w-4" />
                <span>رجوع</span>
              </button>
              <button type="button" onClick={handleNext} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold py-3 text-base font-bold text-slate-950 transition hover:bg-gold-dark active:scale-95">
                <span>المتابعة لكلمة السر</span>
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-200">كلمة السر (6 خانات على الأقل) *</label>
              <input type="password" value={formData.password} onChange={(e) => updateField('password', e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-200">تأكيد كلمة السر *</label>
              <input type="password" value={formData.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/15 bg-slate-800/80 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(2)} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10">
                <ArrowRight className="h-4 w-4" />
                <span>رجوع</span>
              </button>
              <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-bio-teal py-3.5 text-base font-black text-white shadow-xl transition hover:brightness-110 active:scale-95 disabled:opacity-50">
                <ShieldCheck className="h-5 w-5" />
                <span>{isSubmitting ? 'جارٍ إنشاء الحساب...' : 'تأكيد وإنشاء الحساب 🎉'}</span>
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        لديك حساب بالفعل؟{' '}
        <Link prefetch={false} href="/login" className="font-bold text-gold hover:underline">
          تسجيل الدخول هنا
        </Link>
      </p>
    </div>
  );
}
