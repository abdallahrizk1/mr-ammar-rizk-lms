'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, X, Smartphone, Copy, Check } from 'lucide-react';

/**
 * InAppBrowserBanner
 * Detects internal WebViews (Facebook, Instagram, WhatsApp, Telegram)
 * and warns Egyptian students to open the LMS in Safari / Chrome for full HLS video support.
 */
export function InAppBrowserBanner() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    const inAppPatterns = [
      /FBAN/i,
      /FBAV/i,
      /Instagram/i,
      /WhatsApp/i,
      /Telegram/i,
      /Line/i,
      /Twitter/i,
      /Snapchat/i,
    ];

    const detected = inAppPatterns.some((pattern) => pattern.test(ua));
    if (detected && !sessionStorage.getItem('dismissed_inapp_banner')) {
      setIsInAppBrowser(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('dismissed_inapp_banner', 'true');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (!isInAppBrowser || isDismissed) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="relative z-50 border-b border-gold/30 bg-gradient-to-r from-bio-darkest via-bio-deep to-bio-darkest px-4 py-3 text-white shadow-lg"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gold/20 p-2 text-gold">
            <Smartphone className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-gold">
              ⚠️ أنت تتصفح من داخل تطبيق (فيسبوك أو واتساب أو تليجرام)
            </p>
            <p className="text-xs text-slate-300">
              للحصول على أفضل تجربة لمشاهدة الفيديوهات وتكبير الشاشة، اضغط على الثلاث نقاط (⋮) واختر{' '}
              <span className="font-semibold text-white">"فتح في المتصفح" (Chrome أو Safari)</span>.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>تم نسخ الرابط!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="إغلاق التنبيه"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
