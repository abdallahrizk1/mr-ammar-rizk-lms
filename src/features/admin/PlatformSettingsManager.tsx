'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Phone, CreditCard, MessageSquare, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function PlatformSettingsManager() {
  const [vodafoneCash, setVodafoneCash] = useState('01011112222, 01033334444');
  const [instapayHandle, setInstapayHandle] = useState('ammar-rizk@instapay');
  const [supportWhatsapp, setSupportWhatsapp] = useState('01000000000');
  const [refundPolicy, setRefundPolicy] = useState('يحق للطالب استرداد المبلغ خلال 24 ساعة إذا لم يشاهد أكثر من محاضرة واحدة.');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.from('platform_settings').select('*').limit(1).single();
      if (data) {
        if (Array.isArray(data.vodafone_cash_numbers)) {
          setVodafoneCash(data.vodafone_cash_numbers.join(', '));
        }
        if (data.instapay_address) setInstapayHandle(data.instapay_address);
        if (data.support_whatsapp) setSupportWhatsapp(data.support_whatsapp);
        if (data.refund_policy_text) setRefundPolicy(data.refund_policy_text);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const supabase = createClient();
      const numbersArray = vodafoneCash
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean);

      const payload = {
        vodafone_cash_numbers: numbersArray,
        instapay_address: instapayHandle.trim(),
        support_whatsapp: supportWhatsapp.trim(),
        refund_policy_text: refundPolicy.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('platform_settings').upsert({ id: 1, ...payload });

      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {}
    setIsSaving(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-teal-500/20 dark:bg-[#091D20] space-y-6" dir="rtl">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-bio-teal dark:text-emerald-400" />
          <span>إعدادات المنصة وطرق الدفع والدعم الفني</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-teal-200/60 mt-0.5">
          تعديل أرقام فودافون كاش، عنوان إنستا باي، وواتساب الدعم مباشرة في الداتابيز دون المساس بالكود
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
        {saveSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>تم حفظ وتحديث إعدادات المنصة في قاعدة البيانات بنجاح! 🎉</span>
          </div>
        )}

        <div>
          <label className="text-xs font-bold block mb-1.5 flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Phone className="h-3.5 w-3.5 text-rose-500" />
            <span>أرقام محافظ فودافون كاش المعتمدة (مفصولة بفاصلة) *</span>
          </label>
          <input
            type="text"
            value={vodafoneCash}
            onChange={(e) => setVodafoneCash(e.target.value)}
            placeholder="01011112222, 01033334444"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-teal-500/30 text-xs dark:bg-[#071719] text-left font-mono"
            dir="ltr"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1.5 flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <CreditCard className="h-3.5 w-3.5 text-bio-teal dark:text-emerald-400" />
            <span>عنوان أو رقم حساب إنستا باي (InstaPay Handle / IPA) *</span>
          </label>
          <input
            type="text"
            value={instapayHandle}
            onChange={(e) => setInstapayHandle(e.target.value)}
            placeholder="username@instapay"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-teal-500/30 text-xs dark:bg-[#071719] text-left font-mono"
            dir="ltr"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1.5 flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
            <span>رقم واتساب الدعم الفني للمنصة *</span>
          </label>
          <input
            type="text"
            value={supportWhatsapp}
            onChange={(e) => setSupportWhatsapp(e.target.value)}
            placeholder="01000000000"
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-teal-500/30 text-xs dark:bg-[#071719] text-left font-mono"
            dir="ltr"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1.5 flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            <span>شروط وسياسة الاسترجاع</span>
          </label>
          <textarea
            value={refundPolicy}
            onChange={(e) => setRefundPolicy(e.target.value)}
            rows={3}
            className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-teal-500/30 text-xs dark:bg-[#071719]"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-bio-teal dark:bg-emerald-600 text-white text-xs font-bold shadow hover:bg-bio-deep"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات في Supabase'}</span>
        </button>
      </form>
    </div>
  );
}
