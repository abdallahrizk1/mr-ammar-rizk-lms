'use server';

import { createAdminClient } from '@/lib/server/supabase-admin';
import { normalizePhoneNumber } from '@/lib/utils/input-normalizer';

export async function resetStudentPasswordAction(userId: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'كلمة السر الجديدة يجب ألا تقل عن 6 خانات' };
    }
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تغيير كلمة السر';
    return { success: false, error: msg };
  }
}

export async function createAssistantAccountAction(data: {
  fullName: string;
  phone: string;
  password: string;
  permissions: Record<string, boolean>;
}) {
  try {
    const cleanPhone = normalizePhoneNumber(data.phone);
    if (!/^01[0125]\d{8}$/.test(cleanPhone)) {
      return { success: false, error: 'رقم هاتف المساعد غير صحيح' };
    }
    if (data.password.length < 6) {
      return { success: false, error: 'كلمة السر لا تقل عن 6 خانات' };
    }

    const admin = createAdminClient();
    const virtualEmail = `${cleanPhone}@staff.platform.local`;

    const { data: newUser, error } = await admin.auth.admin.createUser({
      email: virtualEmail,
      password: data.password,
      email_confirm: true,
      app_metadata: {
        role: 'assistant',
        phone: cleanPhone,
        permissions: data.permissions,
      },
      user_metadata: {
        full_name: data.fullName.trim(),
        phone: cleanPhone,
        parent_phone: '01500000000',
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true, userId: newUser.user.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء حساب المساعد';
    return { success: false, error: msg };
  }
}

export async function updateAssistantPermissionsAction(
  assistantId: string,
  permissions: Record<string, boolean>
) {
  try {
    const admin = createAdminClient();
    const { error: profileError } = await admin
      .from('profiles')
      .update({ permissions })
      .eq('id', assistantId);

    if (profileError) return { success: false, error: profileError.message };

    await admin.auth.admin.updateUserById(assistantId, {
      app_metadata: { permissions },
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تحديث الصلاحيات';
    return { success: false, error: msg };
  }
}
