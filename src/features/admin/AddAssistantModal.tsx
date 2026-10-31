'use client';

import React from 'react';
import type { AdminPermissions } from './admin-types';

interface AddAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  errorMsg: string;
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  newPermissions: Record<string, boolean>;
  onTogglePermission: (key: string) => void;
  permissionKeys: { key: keyof AdminPermissions; label: string }[];
  isSaving: boolean;
}

export function AddAssistantModal({
  isOpen,
  onClose,
  onSubmit,
  errorMsg,
  fullName,
  setFullName,
  phone,
  setPhone,
  password,
  setPassword,
  newPermissions,
  onTogglePermission,
  permissionKeys,
  isSaving,
}: AddAssistantModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" dir="rtl">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D2628] p-5 space-y-3">
        <h4 className="text-sm font-bold text-bio-teal dark:text-emerald-400">إضافة حساب مساعد جديد</h4>

        {errorMsg && <p className="text-xs text-rose-500 font-bold">{errorMsg}</p>}

        <div>
          <label className="text-[11px] font-bold block mb-1">اسم المساعد بالكامل *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثال: أحمد مصطفى"
            className="w-full p-2 rounded-xl border text-xs dark:bg-[#071719]"
            required
          />
        </div>

        <div>
          <label className="text-[11px] font-bold block mb-1">رقم هاتف المساعد *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010XXXXXXXX"
            className="w-full p-2 rounded-xl border text-xs dark:bg-[#071719] text-left font-mono"
            dir="ltr"
            required
          />
        </div>

        <div>
          <label className="text-[11px] font-bold block mb-1">كلمة السر (6 خانات+) *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-2 rounded-xl border text-xs dark:bg-[#071719] text-left font-mono"
            dir="ltr"
            required
          />
        </div>

        <div>
          <label className="text-[11px] font-bold block mb-1.5">تحديد الصلاحيات الممنوحة:</label>
          <div className="space-y-1.5">
            {permissionKeys.map((p) => (
              <div
                key={p.key}
                onClick={() => onTogglePermission(p.key)}
                className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50 dark:bg-[#071719] cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={!!newPermissions[p.key]}
                  onChange={() => {}}
                  className="h-4 w-4 rounded accent-bio-teal"
                />
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg border text-xs">إلغاء</button>
          <button type="submit" disabled={isSaving} className="px-4 py-1.5 rounded-lg bg-bio-teal text-white text-xs font-bold">
            {isSaving ? 'جارٍ الإنشاء...' : 'إنشاء حساب المساعد'}
          </button>
        </div>
      </form>
    </div>
  );
}
