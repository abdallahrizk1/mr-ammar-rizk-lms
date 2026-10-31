'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, CheckSquare, Square, RefreshCw, Key } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createAssistantAccountAction, updateAssistantPermissionsAction } from '@/app/actions/admin-actions';
import type { AdminPermissions } from './admin-types';
import { AddAssistantModal } from './AddAssistantModal';

interface AssistantProfile {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  permissions: AdminPermissions;
  created_at: string;
}

const PERMISSION_KEYS: { key: keyof AdminPermissions; label: string }[] = [
  { key: 'manage_courses', label: 'إدارة وبناء الكورسات والمحاضرات' },
  { key: 'manage_exams', label: 'إنشاء وتعديل الامتحانات والأسئلة' },
  { key: 'manage_payments', label: 'مراجعة وتفعيل إيصالات الدفع والأكواد' },
  { key: 'manage_students', label: 'إدارة شؤون الطلاب وتغيير كلمات السر' },
  { key: 'manage_forum', label: 'الرد على أسئلة المنتدى صوتياً وكتابياً' },
  { key: 'manage_settings', label: 'تعديل أرقام الدفع وإرسال الإشعارات' },
];

export function StaffManager() {
  const [assistants, setAssistants] = useState<AssistantProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>({
    manage_courses: true,
    manage_exams: true,
    manage_payments: true,
    manage_students: true,
    manage_forum: true,
    manage_settings: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAssistants = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'assistant')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (data) setAssistants(data);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleTogglePermission = (key: string) => {
    setNewPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || password.length < 6) return;

    setIsSaving(true);
    setErrorMsg('');
    const res = await createAssistantAccountAction({
      fullName: fullName.trim(),
      phone: phone.trim(),
      password,
      permissions: newPermissions,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'حدث خطأ أثناء إنشاء حساب المساعد');
      setIsSaving(false);
      return;
    }

    setIsModalOpen(false);
    setFullName('');
    setPhone('');
    setPassword('');
    setIsSaving(false);
    fetchAssistants();
  };

  const handleUpdatePerm = async (assistantId: string, permKey: keyof AdminPermissions, currentVal: boolean) => {
    const assistant = assistants.find((a) => a.id === assistantId);
    if (!assistant) return;

    const updated = { ...assistant.permissions, [permKey]: !currentVal };
    await updateAssistantPermissionsAction(assistantId, updated);
    setAssistants((prev) =>
      prev.map((a) => (a.id === assistantId ? { ...a, permissions: updated } : a))
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-5" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
            <span>إدارة حسابات المساعدين والصلاحيات (super_admin)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
            خاص بالأستاذ عمار رزق: إضافة المساعدين وتحديد الصلاحيات الدقيقة لكل مساعد
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs font-bold shadow hover:bg-bio-deep"
        >
          <UserPlus className="h-4 w-4" />
          <span>إضافة مساعد جديد</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">جارٍ جلب المساعدين...</div>
      ) : assistants.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          لا يوجد مساعدون مسجلون حالياً. يمكنك إضافة حساب مساعد وتحديد صلاحياته.
        </div>
      ) : (
        <div className="space-y-3">
          {assistants.map((a) => (
            <div key={a.id} className="p-4 rounded-xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-[#071719] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{a.full_name}</h4>
                  <span className="text-xs text-slate-400 font-mono">{a.phone}</span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-bio-teal/15 text-bio-teal dark:bg-emerald-500/20 dark:text-emerald-300">
                  مساعد معتمد 🛡️
                </span>
              </div>

              {/* Permission Checkboxes */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">صلاحيات المساعد:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PERMISSION_KEYS.map((p) => {
                    const isChecked = !!a.permissions[p.key];
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleUpdatePerm(a.id, p.key, isChecked)}
                        className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-bold border text-right transition ${
                          isChecked
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 bg-white dark:bg-[#091D20] text-slate-400'
                        }`}
                      >
                        {isChecked ? <CheckSquare className="h-4 w-4 text-emerald-500" /> : <Square className="h-4 w-4 text-slate-300" />}
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAssistantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAssistant}
        errorMsg={errorMsg}
        fullName={fullName}
        setFullName={setFullName}
        phone={phone}
        setPhone={setPhone}
        password={password}
        setPassword={setPassword}
        newPermissions={newPermissions}
        onTogglePermission={handleTogglePermission}
        permissionKeys={PERMISSION_KEYS}
        isSaving={isSaving}
      />
    </div>
  );
}
