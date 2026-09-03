'use client';

import { ChevronDown } from 'lucide-react';

export function TrendChart() {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <section className="zd-panel zd-rise zd-d2 rounded-2xl p-5 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--zd-text)]">تكاليف الوقود والصيانة</h2>
          <p className="mt-1 text-[10px] text-[var(--zd-muted)]">آخر ٧ أيام · بالريال السعودي</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[var(--zd-muted)]">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#5d8cff]" /> الوقود
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#57d0bf]" /> الصيانة
          </span>
          <button className="mr-2 flex items-center gap-1 text-[var(--zd-blue)] font-medium">
            هذا الأسبوع <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="mt-5 h-[190px] w-full">
        <svg
          viewBox="0 0 760 220"
          className="h-full w-full"
          preserveAspectRatio="none"
          aria-label="رسم بياني لتكاليف الوقود والصيانة"
        >
          <defs>
            <linearGradient id="blueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#5d8cff" stopOpacity=".23" />
              <stop offset="1" stopColor="#5d8cff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="tealFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#57d0bf" stopOpacity=".16" />
              <stop offset="1" stopColor="#57d0bf" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[28, 72, 116, 160, 204].map((y) => (
            <line key={y} x1="0" y1={y} x2="760" y2={y} stroke="currentColor" className="text-[var(--zd-line)]" strokeWidth="1" />
          ))}
          <path
            d="M0 87 C60 74 85 64 145 76 S245 92 300 72 S395 52 450 72 S548 80 605 50 S700 40 760 28 L760 204 L0 204Z"
            fill="url(#blueFill)"
          />
          <path
            d="M0 87 C60 74 85 64 145 76 S245 92 300 72 S395 52 450 72 S548 80 605 50 S700 40 760 28"
            fill="none"
            stroke="#5d8cff"
            strokeWidth="3"
          />
          <path
            d="M0 161 C70 153 112 146 160 159 S245 182 300 157 S380 129 430 146 S530 164 600 165 S690 152 760 135 L760 204 L0 204Z"
            fill="url(#tealFill)"
          />
          <path
            d="M0 161 C70 153 112 146 160 159 S245 182 300 157 S380 129 430 146 S530 164 600 165 S690 152 760 135"
            fill="none"
            stroke="#57d0bf"
            strokeWidth="3"
          />
          {days.map((d, i) => (
            <text key={d} x={i * 126 + 5} y="219" fill="currentColor" className="text-[var(--zd-muted)]" fontSize="10">
              {d}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
