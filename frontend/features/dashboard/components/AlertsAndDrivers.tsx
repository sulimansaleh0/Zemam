'use client';

import { AlertTriangle, ChevronDown, ChevronLeft, MoreHorizontal } from 'lucide-react';

export function AlertsAndDrivers() {
  const alerts = [
    ['موعد صيانة المركبة ABC-1234 خلال ٣ أيام', 'منذ ١٢ دقيقة', '#eab66b'],
    ['تجاوز السرعة — المركبة XYZ-5678', 'منذ ٤٥ دقيقة', '#eb6974'],
    ['السائق محمد الحربي أنهى ١٠٨٪ من المسار', 'منذ ساعة', '#5d8cff'],
    ['انخفاض مستوى الوقود في المركبة DEF-9012', 'منذ ساعتين', '#eab66b'],
  ] as const;

  const drivers = [
    ['حمد الأحمد', '٤.٩', '312', 'ممتاز', '#5d8cff'],
    ['خالد السعيد', '٤.٧', '289', 'جيد', '#ab79e9'],
    ['راشد محمد', '٤.٥', '245', 'جيد', '#e7a849'],
    ['ماجد العنزي', '٤.٢', '198', 'في المراجعة', '#57d0bf'],
    ['سعد الزهراني', '٣.٨', '167', 'غير نشط', '#b7c3d5'],
  ] as const;

  return (
    <>
      {/* ── Recent Alerts ── */}
      <section className="zd-panel zd-rise zd-d4 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[var(--zd-text)]">التنبيهات الأخيرة</h2>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">ما يحتاج انتباهك الآن</p>
          </div>
          <span className="rounded-full bg-[var(--zd-red)]/15 px-2 py-1 text-[9px] font-semibold text-[var(--zd-red)]">
            ٣ جديد
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {alerts.map(([text, time, color]) => (
            <div
              key={text}
              className="flex gap-3 rounded-xl border px-3 py-3"
              style={{ borderColor: `${color}40`, background: `${color}12` }}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
              <div>
                <div className="text-[11px] font-medium text-[var(--zd-text)]">{text}</div>
                <div className="mt-1 text-[9px] text-[var(--zd-muted)]">{time}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 flex w-full items-center justify-center text-[11px] font-medium text-[var(--zd-blue)]">
          مركز التنبيهات <ChevronLeft className="mr-1 h-3 w-3" />
        </button>
      </section>

      {/* ── Drivers Performance ── */}
      <section className="zd-panel zd-rise zd-d4 overflow-hidden rounded-2xl p-5 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[var(--zd-text)]">أداء السائقين</h2>
            <p className="mt-1 text-[10px] text-[var(--zd-muted)]">ملخص الأداء خلال هذا الأسبوع</p>
          </div>
          <button className="flex items-center gap-1 rounded-lg border border-[var(--zd-line)] bg-[var(--zd-surface)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--zd-muted)] hover:text-[var(--zd-text)] transition-colors">
            هذا الأسبوع <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-[11px]">
            <thead className="border-b border-[var(--zd-line)] text-[10px] text-[var(--zd-muted)]">
              <tr>
                <th className="pb-3 font-medium">السائق</th>
                <th className="pb-3 font-medium">التقييم</th>
                <th className="pb-3 font-medium">الرحلات</th>
                <th className="pb-3 font-medium">الوقود</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {drivers.map(([name, rating, trips, status, color]) => (
                <tr key={name} className="border-b border-[var(--zd-line)] last:border-0">
                  <td className="py-3">
                    <span className="flex items-center gap-2.5">
                      <i
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs"
                        style={{ background: color }}
                      >
                        {name[0]}
                      </i>
                      <span className="font-medium text-[var(--zd-text)]">{name}</span>
                    </span>
                  </td>
                  <td className="py-3 font-manrope text-[var(--zd-text)]">
                    <span className="text-[var(--zd-amber)]">★</span> {rating}
                  </td>
                  <td className="py-3 font-manrope text-[var(--zd-muted)]">{trips}</td>
                  <td className="py-3 text-[var(--zd-muted)]">ممتاز</td>
                  <td className="py-3">
                    <span className="rounded-full bg-[var(--zd-teal)]/15 px-2 py-1 text-[9px] font-medium text-[var(--zd-teal)]">
                      {status}
                    </span>
                  </td>
                  <td className="py-3">
                    <MoreHorizontal className="h-4 w-4 text-[var(--zd-muted)]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
