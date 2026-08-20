'use client';

import { Sparkles } from 'lucide-react';

export function AiRecommendations() {
  const recommendations = [
    [
      'رحلة توفيرية',
      'يمكن تقليل تكلفة الوقود ١٢٪ عبر تحسين مسار جدة — مكة.',
      '#5d8cff',
    ],
    [
      'تجديد الوقود',
      'متوسط استهلاك المركبة ABC-1234 أعلى من المعتاد.',
      '#eab66b',
    ],
    [
      'صحة الأسطول',
      'حان موعد فحص ٤ مركبات خلال الأيام القادمة.',
      '#57d0bf',
    ],
  ] as const;

  return (
    <section className="zd-panel zd-rise zd-d3 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--zd-blue)]/15 text-[var(--zd-blue)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[14px] font-bold text-[var(--zd-text)]">توصيات الذكاء</h2>
            <p className="text-[10px] text-[var(--zd-muted)]">مقترحات مبنية على بياناتك</p>
          </div>
        </div>
        <span className="rounded-full bg-[var(--zd-blue)]/15 px-2 py-1 text-[9px] font-semibold text-[var(--zd-blue)]">
          ٣ جديدة
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {recommendations.map(([title, text, color]) => (
          <div key={title} className="rounded-xl border border-[var(--zd-line)] bg-[var(--zd-surface-2)]/40 p-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--zd-text)]">
              <i className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: color }} />
              {title}
            </div>
            <p className="mt-1 text-[10px] leading-5 text-[var(--zd-muted)]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
