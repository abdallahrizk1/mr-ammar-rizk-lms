'use client';

import React from 'react';
import { User, Phone, MapPin, GraduationCap, Calendar, BookOpen } from 'lucide-react';
import { StudentProfile } from '@/lib/data/student-profile-data';

interface StudentProfileCardProps {
  profile: StudentProfile;
}

export function StudentProfileCard({ profile }: StudentProfileCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-teal-500/15">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-bio-teal to-[#0d3435] text-white shadow-md shrink-0">
            <User className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-emerald-300">
                {profile.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                <Calendar className="h-3 w-3" />
                عضو منذ {profile.memberSince} • {profile.memberDate}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-teal-200/70 mt-0.5">
              بطاقة بيانات الطالب وإعدادات الحساب التعليمي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-slate-100 dark:bg-[#071719] px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-teal-500/20">
            {profile.studyType}
          </span>
          <span className="rounded-xl bg-bio-teal/10 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-bio-teal dark:text-emerald-400 border border-bio-teal/20 dark:border-emerald-500/30">
            {profile.grade}
          </span>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <div className="rounded-xl bg-slate-50 dark:bg-[#071719] border border-slate-200/70 dark:border-teal-500/15 p-2.5">
          <span className="text-[11px] text-slate-400 dark:text-teal-300/60 block">هاتف الطالب</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5" dir="ltr">
            <Phone className="h-3.5 w-3.5 text-bio-teal dark:text-emerald-400 shrink-0" />
            {profile.phone}
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-[#071719] border border-slate-200/70 dark:border-teal-500/15 p-2.5">
          <span className="text-[11px] text-slate-400 dark:text-teal-300/60 block">هاتف ولي الأمر</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5" dir="ltr">
            <Phone className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            {profile.parentPhone}
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-[#071719] border border-slate-200/70 dark:border-teal-500/15 p-2.5">
          <span className="text-[11px] text-slate-400 dark:text-teal-300/60 block">المحافظة</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            {profile.governorate}
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-[#071719] border border-slate-200/70 dark:border-teal-500/15 p-2.5">
          <span className="text-[11px] text-slate-400 dark:text-teal-300/60 block">المسار ونوع الدراسة</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-bio-teal dark:text-emerald-400 shrink-0" />
            ثانوية عامة ({profile.studyType})
          </span>
        </div>
      </div>
    </div>
  );
}
