'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
} from 'lucide-react';
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
  onSetAllPermissions?: (enableAll: boolean) => void;
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
  onSetAllPermissions,
}: AddAssistantModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSaving]);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedCount = permissionKeys.filter((p) => !!newPermissions[p.key]).length;

  const handleBulkToggle = (enableAll: boolean) => {
    if (onSetAllPermissions) {
      onSetAllPermissions(enableAll);
    } else {
      permissionKeys.forEach((p) => {
        const isCurrent = !!newPermissions[p.key];
        if (isCurrent !== enableAll) {
          onTogglePermission(p.key);
        }
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm transition-opacity"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-[#0D2628] shadow-2xl text-slate-900 dark:text-white my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-assistant-title"
      >
        {/* Modal Header (Fixed at top) */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-500/20 px-5 py-4 sm:px-6 sm:py-4.5 bg-slate-50/60 dark:bg-[#091D20]/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bio-teal/10 text-bio-teal dark:bg-emerald-500/20 dark:text-emerald-300">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 id="add-assistant-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                إضافة حساب مساعد جديد
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
                إنشاء حساب معتمد وتحديد صلاحيات لوحة التحكم بدقة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-teal-900/40 transition disabled:opacity-40"
            title="إغلاق النافذة"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Assistant Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-teal-100 mb-1.5">
                اسم المساعد بالكامل <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أحمد مصطفى عبد الرحمن"
                  className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-teal-500/30 bg-slate-50/50 dark:bg-[#071719] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bio-teal/40 transition"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Phone & Password - Responsive 2 Columns on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-teal-100 mb-1.5">
                  رقم هاتف المساعد <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-teal-500/30 bg-slate-50/50 dark:bg-[#071719] text-xs sm:text-sm text-slate-900 dark:text-white text-left font-mono focus:outline-none focus:ring-2 focus:ring-bio-teal/40 transition"
                    dir="ltr"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-teal-200/50 mt-1">يُستخدم لتسجيل دخول المساعد للمنصة</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-teal-100 mb-1.5">
                  كلمة السر (6 خانات+) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-300 dark:border-teal-500/30 bg-slate-50/50 dark:bg-[#071719] text-xs sm:text-sm text-slate-900 dark:text-white text-left font-mono focus:outline-none focus:ring-2 focus:ring-bio-teal/40 transition"
                    dir="ltr"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-teal-200/50 mt-1">يمكن للمساعد تغييرها لاحقاً</p>
              </div>
            </div>

            {/* Permissions Selection */}
            <div className="pt-2 border-t border-slate-100 dark:border-teal-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-bio-teal dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-teal-100">
                    تحديد الصلاحيات الممنوحة:
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#071719] text-bio-teal dark:text-emerald-300 border border-slate-200 dark:border-teal-500/20">
                    {selectedCount} من {permissionKeys.length} مفعلة
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleBulkToggle(true)}
                    className="text-bio-teal hover:underline dark:text-emerald-400 font-bold"
                  >
                    تحديد الكل
                  </button>
                  <span className="text-slate-300 dark:text-teal-900">|</span>
                  <button
                    type="button"
                    onClick={() => handleBulkToggle(false)}
                    className="text-slate-400 hover:underline hover:text-slate-600 dark:hover:text-slate-200 font-bold"
                  >
                    إلغاء الكل
                  </button>
                </div>
              </div>

              {/* 2-Column Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {permissionKeys.map((p) => {
                  const isChecked = !!newPermissions[p.key];
                  return (
                    <div
                      key={p.key}
                      onClick={() => onTogglePermission(p.key)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 shadow-sm'
                          : 'border-slate-200 dark:border-teal-500/20 bg-slate-50/60 dark:bg-[#071719] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#071719]/80'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <span className="text-xs font-semibold leading-relaxed">
                        {p.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer (Pinned at bottom) */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 dark:border-teal-500/20 bg-slate-50/70 dark:bg-[#091D20]/70 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-teal-500/30 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-teal-900/30 transition disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جارٍ الإنشاء...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>إنشاء حساب المساعد</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
