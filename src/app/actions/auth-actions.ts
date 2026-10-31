'use server';

import { createAdminClient } from '@/lib/server/supabase-admin';
import { phoneToVirtualEmail, normalizePhoneNumber } from '@/lib/utils/input-normalizer';

export interface RegisterStudentInput {
  fullName: string;
  phone: string;
  parentPhone: string;
  gradeId: string;
  educationType: string;
  governorate: string;
  gender: string;
  password: string;
}

export async function registerStudentAction(input: RegisterStudentInput) {
  try {
    const cleanPhone = normalizePhoneNumber(input.phone);
    const cleanParentPhone = normalizePhoneNumber(input.parentPhone);
    const virtualEmail = phoneToVirtualEmail(cleanPhone);

    if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
      return { success: false, error: 'رقم هاتف الطالب غير صحيح' };
    }
    if (!/^01[0125]\d{8}$/.test(cleanParentPhone)) {
      return { success: false, error: 'رقم هاتف ولي الأمر غير صحيح' };
    }
    if (cleanPhone === cleanParentPhone) {
      return { success: false, error: 'ممنوع تطابق رقم الطالب مع رقم ولي الأمر' };
    }
    if (input.password.length < 6) {
      return { success: false, error: 'كلمة السر يجب ألا تقل عن 6 أحرف' };
    }

    const adminClient = createAdminClient();

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const isTaken = existingUsers?.users?.some((u) => u.email === virtualEmail);
    if (isTaken) {
      return { success: false, error: 'رقم الهاتف مسجل بالفعل مسبقاً، يرجى تسجيل الدخول' };
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email: virtualEmail,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName.trim(),
        phone: cleanPhone,
        parent_phone: cleanParentPhone,
        grade_level: input.gradeId,
        education_type: input.educationType,
        governorate: input.governorate,
        gender: input.gender,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      userId: data.user.id,
      virtualEmail,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء التسجيل';
    return { success: false, error: msg };
  }
}
