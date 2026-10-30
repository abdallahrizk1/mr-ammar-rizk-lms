import { z } from 'zod';
import { isValidEgyptianPhone, normalizePhoneNumber } from '@/lib/utils/input-normalizer';

export const EDUCATION_TYPES = [
  { value: 'general', label: 'ثانوي عام' },
  { value: 'azhar', label: 'ثانوي أزهري' },
  { value: 'languages', label: 'ثانوي لغات' },
] as const;

export const HIGH_SCHOOL_GRADES = [
  { value: '1', label: 'الصف الأول الثانوي' },
  { value: '2', label: 'الصف الثاني الثانوي' },
  { value: '3', label: 'الصف الثالث الثانوي (دفعة 2027)' },
] as const;

export const EGYPTIAN_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'المنوفية',
  'القليوبية',
  'البحيرة',
  'الغربية',
  'بورسعيد',
  'دمياط',
  'الإسماعيلية',
  'السويس',
  'كفر الشيخ',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
] as const;

// Step 1: Personal Info
export const registerStep1Schema = z.object({
  fullName: z
    .string()
    .min(3, 'الاسم يجب ألا يقل عن 3 أحرف')
    .max(80, 'الاسم طويل جداً'),
  phone: z
    .string()
    .transform(normalizePhoneNumber)
    .refine(isValidEgyptianPhone, 'رقم هاتف الطالب غير صحيح، يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015'),
});

// Step 2: Academic & Family Info
export const registerStep2Schema = z.object({
  gradeId: z.string().min(1, 'الرجاء اختيار الصف الدراسي'),
  educationType: z.enum(['general', 'azhar', 'languages'], {
    errorMap: () => ({ message: 'الرجاء اختيار نوع التعليم' }),
  }),
  governorate: z.string().min(1, 'الرجاء اختيار المحافظة'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: 'الرجاء تحديد النوع' }),
  }),
  parentPhone: z
    .string()
    .transform(normalizePhoneNumber)
    .refine(isValidEgyptianPhone, 'رقم ولي الأمر غير صحيح، يجب أن يتكون من 11 رقماً'),
});

// Step 3: Security & Password
export const registerStep3Schema = z
  .object({
    password: z.string().min(6, 'كلمة السر يجب ألا تقل عن 6 خانات'),
    confirmPassword: z.string().min(6, 'الرجاء تأكيد كلمة السر'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا السر غير متطابقتين',
    path: ['confirmPassword'],
  });

// Complete 3-Step Registration Schema with Cross-Field Phone Constraint
export const fullRegisterSchema = z
  .object({
    fullName: registerStep1Schema.shape.fullName,
    phone: registerStep1Schema.shape.phone,
    gradeId: registerStep2Schema.shape.gradeId,
    educationType: registerStep2Schema.shape.educationType,
    governorate: registerStep2Schema.shape.governorate,
    gender: registerStep2Schema.shape.gender,
    parentPhone: registerStep2Schema.shape.parentPhone,
    password: z.string().min(6, 'كلمة السر يجب ألا تقل عن 6 خانات'),
    confirmPassword: z.string().min(6, 'الرجاء تأكيد كلمة السر'),
  })
  .refine((data) => data.phone !== data.parentPhone, {
    message: 'رقم هاتف ولي الأمر يجب أن يكون مختلفاً تماماً عن رقم هاتف الطالب!',
    path: ['parentPhone'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا السر غير متطابقتين',
    path: ['confirmPassword'],
  });

export type FullRegisterInput = z.infer<typeof fullRegisterSchema>;

// Login Schema
export const loginSchema = z.object({
  phone: z
    .string()
    .transform(normalizePhoneNumber)
    .refine(isValidEgyptianPhone, 'الرجاء إدخال رقم هاتف صالح (11 رقم)'),
  password: z.string().min(1, 'الرجاء إدخال كلمة السر'),
});

export type LoginInput = z.infer<typeof loginSchema>;
