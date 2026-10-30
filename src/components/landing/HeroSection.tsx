'use client';

import React from 'react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-8 sm:py-12 lg:py-14 bg-[#134647] text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
          
          {/* Right Column: Copy & Actions */}
          <div className="lg:col-span-7 text-right">
            {/* Main Headline - Balanced & Legible across all laptop & phone screens */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug tracking-tight">
              منصتك الأولى لتعلم
              <br />
              وفهم الأحياء
              <br />
              بأسلوب بسيط وممتع
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-xs sm:text-sm lg:text-base leading-relaxed text-teal-100 max-w-xl">
              أهلاً بيك في بيتك التاني! سواء كنت في أولى، تانية، أو تالتة ثانوي، هنا هتلاقي كل اللي تحتاجه علشان تتفوق في الأحياء، وتفهمها صح، وتطبقها بسهولة.
            </p>

            {/* Mint CTA Button */}
            <div className="mt-6">
              <Link
                href="/register"
                prefetch={false}
                className="inline-flex items-center justify-center rounded-xl bg-[#6EE7B7] hover:bg-[#34D399] px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-slate-950 shadow-md transition active:scale-95"
              >
                اشترك دلوقتي !
              </Link>
            </div>
          </div>

          {/* Left Column: Teacher High-Res Circular Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-52 w-52 sm:h-64 sm:w-64 lg:h-72 lg:w-72 overflow-hidden rounded-full border-4 border-white/20 shadow-xl bg-teal-950/40">
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
