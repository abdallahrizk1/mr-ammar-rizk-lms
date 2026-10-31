'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ChevronRight, CreditCard, KeyRound, Smartphone } from 'lucide-react';
import { InvoiceSummaryStep } from '@/features/payments/InvoiceSummaryStep';
import { CenterCodeMethod } from '@/features/payments/CenterCodeMethod';
import { VodafoneInstapayMethod } from '@/features/payments/VodafoneInstapayMethod';
import { InstantActivationCelebration } from '@/features/payments/InstantActivationCelebration';
import { PaymentStep, PaymentMethodType } from '@/features/payments/payments-types';
import { CourseItem } from '@/lib/data/courses-types';
import { SAMPLE_COURSES } from '@/lib/data/courses-data';
import { createClient } from '@/lib/supabase/client';
import { addTemporaryEnrolledCourse } from '@/lib/utils/student-storage';

interface PageProps {
  params: { courseId: string } | Promise<{ courseId: string }>;
}

export default function CourseSubscribePage({ params }: PageProps) {
  const resolvedParams = params && typeof (params as any)?.then === 'function' ? use(params as any) : (params as any) || {};
  const { courseId } = resolvedParams;

  const [course, setCourse] = useState<CourseItem>({
    id: courseId || 'course-1',
    title: 'كورس الأحياء',
    tagline: 'منهج الأحياء 2027',
    description: '',
    grade: 'الصف الثالث الثانوي',
    price: 350,
    priceFormatted: '350 ج.م',
    isComprehensive: false,
    isEnrolled: false,
    isTemporary: false,
    progress: 0,
    bannerImage: '/images/teacher-circle.png',
    lecturesCount: 12,
    modules: [],
  });

  const [currentStep, setCurrentStep] = useState<PaymentStep>(1);
  const [method, setMethod] = useState<PaymentMethodType>('center_code');
  const [isCenterCodeActivation, setIsCenterCodeActivation] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseId)) {
        const sample = SAMPLE_COURSES.find((c) => c.id === courseId);
        if (sample) setCourse(sample);
        return;
      }
      try {
        const supabase = createClient();
        const { data } = await supabase.from('courses').select('*').eq('id', courseId).single();
        if (data) {
          setCourse({
            id: data.id,
            title: data.title,
            tagline: data.description || 'منهج الأحياء 2027',
            description: data.description || '',
            grade: `الصف ${data.grade_level} الثانوي`,
            price: data.price,
            priceFormatted: data.price === 0 ? 'مجاني' : `${data.price} ج.م`,
            isComprehensive: !!data.is_bundle,
            isEnrolled: false,
            isTemporary: false,
            progress: 0,
            bannerImage: data.thumbnail_url || '/images/teacher-circle.png',
            lecturesCount: 12,
            modules: [],
          });
        }
      } catch {}
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  const handleActivationComplete = (isCode: boolean) => {
    setIsCenterCodeActivation(isCode);
    addTemporaryEnrolledCourse({
      id: course.id,
      title: course.title,
      grade: course.grade,
    });
    setCurrentStep(3);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-teal-300/70">
        <Link href="/courses" prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400">
          الكورسات
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <Link href={`/courses/${course.id}`} prefetch={false} className="hover:text-bio-teal dark:hover:text-emerald-400">
          {course.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-bold text-slate-900 dark:text-white">
          الاشتراك والدفع
        </span>
      </nav>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
        <div
          className={`rounded-xl p-2.5 border transition ${
            currentStep >= 1
              ? 'bg-bio-teal/10 border-bio-teal text-bio-teal dark:bg-emerald-500/15 dark:border-emerald-500 dark:text-emerald-300'
              : 'bg-white border-slate-200 text-slate-400 dark:bg-[#091D20]'
          }`}
        >
          1. ملخص الفاتورة
        </div>
        <div
          className={`rounded-xl p-2.5 border transition ${
            currentStep >= 2
              ? 'bg-bio-teal/10 border-bio-teal text-bio-teal dark:bg-emerald-500/15 dark:border-emerald-500 dark:text-emerald-300'
              : 'bg-white border-slate-200 text-slate-400 dark:bg-[#091D20]'
          }`}
        >
          2. طريقة الدفع
        </div>
        <div
          className={`rounded-xl p-2.5 border transition ${
            currentStep === 3
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-400 dark:text-emerald-300'
              : 'bg-white border-slate-200 text-slate-400 dark:bg-[#091D20]'
          }`}
        >
          3. التفعيل الفوري
        </div>
      </div>

      {/* Step 1: Invoice Summary */}
      {currentStep === 1 && (
        <InvoiceSummaryStep
          course={course}
          onProceed={() => setCurrentStep(2)}
        />
      )}

      {/* Step 2: Choose Payment Method */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20] space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
              <span>الخطوة 2: اختيار وسيلة الدفع والتفعيل</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
              اختر الطريقة الأنسب لك لتفعيل الكورس فوراً
            </p>
          </div>

          {/* 2 Method Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMethod('center_code')}
              className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold border transition ${
                method === 'center_code'
                  ? 'bg-bio-teal text-white border-bio-teal dark:bg-emerald-600 dark:border-emerald-500 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#071719] dark:border-teal-500/20 dark:text-slate-300'
              }`}
            >
              <KeyRound className="h-4 w-4" />
              <span>كود السنتر / كارت الشحن</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('vodafone_instapay')}
              className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold border transition ${
                method === 'vodafone_instapay'
                  ? 'bg-bio-teal text-white border-bio-teal dark:bg-emerald-600 dark:border-emerald-500 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#071719] dark:border-teal-500/20 dark:text-slate-300'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>فودافون كاش أو إنستا باي</span>
            </button>
          </div>

          {/* Method Content */}
          {method === 'center_code' ? (
            <CenterCodeMethod
              onSuccess={() => handleActivationComplete(true)}
            />
          ) : (
            <VodafoneInstapayMethod
              courseId={course.id}
              coursePrice={course.price}
              onSuccess={() => handleActivationComplete(false)}
            />
          )}
        </div>
      )}

      {/* Step 3: Instant Activation Celebration */}
      {currentStep === 3 && (
        <InstantActivationCelebration
          course={course}
          isCenterCode={isCenterCodeActivation}
        />
      )}
    </div>
  );
}
