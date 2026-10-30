'use client';

import React, { useState } from 'react';
import { Copy, Check, Upload, Send, AlertCircle, FileCheck } from 'lucide-react';
import { normalizePhoneNumber } from '@/lib/utils/input-normalizer';
import { compressImageToWebp } from '@/lib/utils/image-compression';

interface VodafoneInstapayMethodProps {
  onSuccess: (data: { senderPhone: string; transactionRef: string; fileName: string }) => void;
}

const WALLET_NUMBER = '01012345678';
const INSTAPAY_HANDLE = 'ammar.rizk@instapay';

export function VodafoneInstapayMethod({ onSuccess }: VodafoneInstapayMethodProps) {
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);

  const [senderPhone, setSenderPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const copyToClipboard = (text: string, type: 'wallet' | 'insta') => {
    navigator.clipboard.writeText(text);
    if (type === 'wallet') {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } else {
      setCopiedInsta(true);
      setTimeout(() => setCopiedInsta(false), 2000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setErrorMsg('');
      const compressed = await compressImageToWebp(file, { maxSizeBytes: 500 * 1024 });
      setReceiptFile(compressed);
    } catch {
      setErrorMsg('تعذر ضغط الصورة، يرجى اختيار ملف صورة صالح (JPG أو PNG أو WebP)');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizePhoneNumber(senderPhone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('يرجى إدخال رقم الهاتف المحول منه بشكل صحيح');
      return;
    }
    if (!transactionRef.trim()) {
      setErrorMsg('يرجى إدخال الرقم المرجعي للعملية (الموجود بإيصال التحويل)');
      return;
    }
    if (!receiptFile) {
      setErrorMsg('يرجى رفع صورة إيصال التحويل لتأكيد العملية');
      return;
    }

    onSuccess({
      senderPhone: cleanPhone,
      transactionRef: transactionRef.trim(),
      fileName: receiptFile.name,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      {/* Wallet Details Display */}
      <div className="rounded-xl border border-bio-teal/20 bg-bio-teal/5 p-3.5 space-y-3 dark:border-teal-500/20 dark:bg-[#071719]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block">رقم فودافون كاش المعتمد</span>
            <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-emerald-400" dir="ltr">
              {WALLET_NUMBER}
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(WALLET_NUMBER, 'wallet')}
            className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition self-start sm:self-auto"
          >
            {copiedWallet ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedWallet ? 'تم النسخ' : 'نسخ الرقم'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-bio-teal/15">
          <div>
            <span className="text-[10px] text-slate-400 block">عنوان الدفع إنستا باي (InstaPay IPA)</span>
            <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-emerald-400" dir="ltr">
              {INSTAPAY_HANDLE}
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(INSTAPAY_HANDLE, 'insta')}
            className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-[#091D20] border border-slate-200 dark:border-teal-500/30 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition self-start sm:self-auto"
          >
            {copiedInsta ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedInsta ? 'تم النسخ' : 'نسخ العنوان'}</span>
          </button>
        </div>
      </div>

      {/* Input 1: Sender Phone */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          الرقم المحول منه
        </label>
        <input
          type="tel"
          dir="ltr"
          value={senderPhone}
          onChange={(e) => {
            setSenderPhone(e.target.value);
            setErrorMsg('');
          }}
          placeholder="010XXXXXXXX"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-base sm:text-sm text-left text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#091D20] dark:text-white"
        />
      </div>

      {/* Input 2: Transaction Reference ID */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          الرقم المرجعي للعملية (من رسالة فودافون أو إيصال إنستا باي)
        </label>
        <input
          type="text"
          dir="ltr"
          value={transactionRef}
          onChange={(e) => {
            setTransactionRef(e.target.value);
            setErrorMsg('');
          }}
          placeholder="Ref / Transaction ID"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-base sm:text-sm text-left text-slate-900 placeholder-slate-400 focus:border-bio-teal focus:outline-none dark:border-teal-500/30 dark:bg-[#091D20] dark:text-white"
        />
      </div>

      {/* Input 3: Upload Receipt (with WebP compression) */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          صورة إيصال التحويل (تُضغط تلقائياً لـ WebP لسرعة الإرسال)
        </label>
        <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-teal-500/30 bg-slate-50 dark:bg-[#071719] p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#0d2628] transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {receiptFile ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <FileCheck className="h-5 w-5" />
              <span>تم اختيار وضغط الإيصال: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-teal-200/60 text-xs">
              <Upload className="h-6 w-6 text-bio-teal dark:text-emerald-400 mb-1" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {isCompressing ? 'جارٍ ضغط الصورة تلقائياً...' : 'اضغط لاختيار صورة الإيصال'}
              </span>
              <span className="text-[10px] text-slate-400">يدعم PNG و JPG ويتم ضغطها تحت 500KB</span>
            </div>
          )}
        </label>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isCompressing}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-bio-teal hover:bg-bio-deep dark:bg-emerald-600 dark:hover:bg-emerald-500 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm disabled:opacity-40 transition active:scale-95"
      >
        <Send className="h-4 w-4" />
        <span>إرسال بيانات التحويل والتفعيل المؤقت الفوري</span>
      </button>
    </form>
  );
}
