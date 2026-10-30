'use client';

import React from 'react';

interface CardItem {
  number: number;
  title: string;
}

const CARDS: CardItem[] = [
  { number: 1, title: 'شرح بسيط ومفهوم' },
  { number: 2, title: 'فيديوهات برسومات توضيحية' },
  { number: 3, title: 'تمارين تفاعلية على الدروس' },
  { number: 4, title: 'مرونة كاملة في المذاكرة' },
  { number: 5, title: 'اختبارات مستمرة' },
  { number: 6, title: 'محتوى متكامل ومنظم' },
  { number: 7, title: 'تحديث مستمر حسب المنهج' },
  { number: 8, title: 'متابعة مع ولي الأمر' },
];

function DiceDots({ count }: { count: number }) {
  const dotCoords: Record<number, Array<{ x: number; y: number }>> = {
    1: [{ x: 12, y: 12 }],
    2: [{ x: 7, y: 7 }, { x: 17, y: 17 }],
    3: [{ x: 6, y: 6 }, { x: 12, y: 12 }, { x: 18, y: 18 }],
    4: [{ x: 7, y: 7 }, { x: 17, y: 7 }, { x: 7, y: 17 }, { x: 17, y: 17 }],
    5: [{ x: 6, y: 6 }, { x: 18, y: 6 }, { x: 12, y: 12 }, { x: 6, y: 18 }, { x: 18, y: 18 }],
    6: [
      { x: 7, y: 6 }, { x: 17, y: 6 },
      { x: 7, y: 12 }, { x: 17, y: 12 },
      { x: 7, y: 18 }, { x: 17, y: 18 },
    ],
    7: [
      { x: 7, y: 6 }, { x: 17, y: 6 },
      { x: 7, y: 12 }, { x: 12, y: 12 }, { x: 17, y: 12 },
      { x: 7, y: 18 }, { x: 17, y: 18 },
    ],
    8: [
      { x: 6, y: 6 }, { x: 12, y: 6 }, { x: 18, y: 6 },
      { x: 7, y: 12 }, { x: 17, y: 12 },
      { x: 6, y: 18 }, { x: 12, y: 18 }, { x: 18, y: 18 },
    ],
  };

  const dots = dotCoords[count] || [{ x: 12, y: 12 }];

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white opacity-85" aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="2" />
      ))}
    </svg>
  );
}

export function WhyJoinUsSection() {
  return (
    <section className="py-4 sm:py-5 lg:py-6 bg-white dark:bg-[#040D0E] transition-colors" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Centered Heading */}
        <h2 className="text-center text-base sm:text-lg lg:text-xl font-extrabold text-slate-900 dark:text-emerald-300 mb-3 sm:mb-4">
          ليه تشترك معانا؟
        </h2>

        {/* 8 Compact Cards (4x2 on laptop/desktop, 2x4 on tablet, 2x4 or 1x8 on mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {CARDS.map((item) => (
            <div
              key={item.number}
              className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#134647] dark:bg-[#0D2628] dark:border dark:border-teal-500/25 p-2 sm:p-2.5 text-white min-h-[72px] sm:min-h-[80px] shadow-sm"
            >
              {/* Top Row: Number on Right, Dice Dots on Left */}
              <div className="flex items-start justify-between">
                <span className="text-lg sm:text-xl font-black leading-none text-white dark:text-emerald-200">
                  {item.number}
                </span>
                <DiceDots count={item.number} />
              </div>

              {/* Bottom Right Title */}
              <div className="mt-1.5 text-right">
                <h3 className="text-xs sm:text-[13px] font-bold leading-tight text-white">
                  {item.title}
                </h3>
              </div>

              {/* Bottom Mint Green Bar (Matching Image 2) */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-[#6EE7B7]" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
