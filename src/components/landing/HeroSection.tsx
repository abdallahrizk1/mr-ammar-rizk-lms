'use client';

import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-4 sm:py-5 lg:py-6 bg-gradient-to-br from-[#134647] to-[#0A2E2F] dark:from-[#0B2326] dark:to-[#040D0E] text-white border-b border-teal-600/20 dark:border-teal-500/15" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12 lg:gap-6">
          
          {/* Right Column: Copy & Actions */}
          <div className="lg:col-span-7 text-right">
            {/* Main Headline - Balanced & Legible across all laptop & phone screens */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-black leading-snug tracking-tight">
              منصتك الأولى لتعلم
              <br />
              وفهم الأحياء
              <br />
              بأسلوب بسيط وممتع
            </h1>

            {/* Subtitle */}
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-teal-100/90 max-w-lg">
              أهلاً بيك في بيتك التاني! سواء كنت في أولى، تانية، أو تالتة ثانوي، هنا هتلاقي كل اللي تحتاجه علشان تتفوق في الأحياء، وتفهمها صح، وتطبقها بسهولة.
            </p>

            {/* Mint CTA Button */}
            <div className="mt-3 sm:mt-4">
              <Link
                href="/register"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-xl bg-[#6EE7B7] hover:bg-[#34D399] px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-sm transition active:scale-95"
              >
                اشترك دلوقتي !
              </Link>
            </div>
          </div>

          {/* Left Column: Teacher High-Res Circular Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-32 w-32 sm:h-38 sm:w-38 lg:h-44 lg:w-44 overflow-hidden rounded-full border-2 border-white/20 shadow-lg bg-teal-950/40">
                <img
                  src="/images/teacher-circle.png"
                  alt="الأستاذ عمار رزق"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
