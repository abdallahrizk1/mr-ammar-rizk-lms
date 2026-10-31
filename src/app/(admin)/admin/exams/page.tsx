'use client';

import React, { useState } from 'react';
import { ZeroTypingExamBuilder } from '@/features/admin/ZeroTypingExamBuilder';
import { RapidQuestionUploader } from '@/features/admin/RapidQuestionUploader';
import type { AdminExam } from '@/features/admin/admin-types';

export default function AdminExamsPage() {
  const [selectedExam, setSelectedExam] = useState<AdminExam | null>(null);

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          منشئ الامتحانات والواجبات السريع بالصور ⏱️
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-teal-200/70">
          إنشاء كويزات وواجبات، رفع الأسئلة بنقرة واحدة ( أ | ب | ج | د )، وتحديث الإجابات مع إعادة تصحيح تلقائي
        </p>
      </div>

      <ZeroTypingExamBuilder
        selectedExamId={selectedExam?.id}
        onSelectExam={(exam) => setSelectedExam(exam)}
      />

      {selectedExam && (
        <div className="pt-4 border-t border-slate-200 dark:border-teal-500/20">
          <RapidQuestionUploader exam={selectedExam} />
        </div>
      )}
    </div>
  );
}
