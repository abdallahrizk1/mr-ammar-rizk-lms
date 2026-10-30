'use client';

import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface InAppNotification {
  id?: string;
  type?: 'success' | 'info' | 'warning';
  title: string;
  subtitle?: string;
}

interface InAppNotificationBannerProps {
  notification: InAppNotification | null;
  onDismiss: () => void;
}

export function InAppNotificationBanner({
  notification,
  onDismiss,
}: InAppNotificationBannerProps) {
  if (!notification) return null;

  const type = notification.type || 'success';

  const colorClasses =
    type === 'warning'
      ? 'border-amber-500/40 bg-amber-950/95 text-amber-100 shadow-amber-950/40'
      : type === 'info'
      ? 'border-teal-500/40 bg-[#091D20]/95 text-teal-100 shadow-teal-950/40'
      : 'border-emerald-500/40 bg-[#082220]/95 text-emerald-100 shadow-emerald-950/40';

  const Icon =
    type === 'warning' ? AlertTriangle : type === 'info' ? Info : CheckCircle2;

  return (
    <div
      dir="rtl"
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-[70] animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div
        className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md ${colorClasses}`}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white leading-snug">
              {notification.title}
            </p>
            {notification.subtitle && (
              <p className="mt-0.5 text-[11px] text-emerald-200/80 leading-relaxed">
                {notification.subtitle}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white transition shrink-0"
          aria-label="إغلاق الإشعار"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
