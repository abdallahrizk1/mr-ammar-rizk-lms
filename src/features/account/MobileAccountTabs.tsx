'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, LucideIcon } from 'lucide-react';
import { AccountTabId } from './account-types';

export interface TabConfigItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface MobileAccountTabsProps {
  tabs: TabConfigItem[];
  activeTab: AccountTabId;
  onSelectTab: (id: AccountTabId) => void;
}

export function MobileAccountTabs({
  tabs,
  activeTab,
  onSelectTab,
}: MobileAccountTabsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeItem = tabs.find((t) => t.id === activeTab) || tabs[0];
  const ActiveIcon = activeItem.icon;

  const handleSelect = (id: string) => {
    onSelectTab(id as AccountTabId);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden space-y-2.5" dir="rtl">
      {/* Active Tab Bar Card */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-teal-500/20 dark:bg-[#091D20]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bio-teal/10 dark:bg-emerald-500/15 text-bio-teal dark:text-emerald-400">
            <ActiveIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block">القسم المفتوح حالياً:</span>
            <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
              {activeItem.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
            isOpen
              ? 'bg-bio-teal text-white dark:bg-emerald-600 shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#071719] dark:text-teal-200'
          }`}
          aria-expanded={isOpen}
          aria-label="تبديل أقسام الحساب"
        >
          <span>{isOpen ? 'إخفاء الأقسام' : 'كل الأقسام (6)'}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Vertical Cards matching media_1793372334653_2dc334c4.png */}
      {isOpen && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-teal-500/20 dark:bg-[#091D20] space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-teal-500/15">
            <span className="text-xs font-bold text-slate-500 dark:text-teal-300/70">
              اختر القسم المطلوب:
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition"
              aria-label="إغلاق القائمة"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelect(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition active:scale-[0.99] ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-600/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                      : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100 dark:bg-[#071719] dark:border-teal-500/15 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-white dark:bg-[#091D20] text-slate-500 dark:text-teal-300/70'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold truncate">{tab.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                        {tab.badge}
                      </span>
                    )}
                    <ChevronLeft
                      className={`h-4 w-4 ${
                        isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
