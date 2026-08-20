'use client';

import { CalendarClock, Check, Clock3, UsersRound, type LucideIcon } from 'lucide-react';

interface DriverMetricsProps {
  metrics: {
    total: number;
    active: number;
    expiringSoon: number;
    leaveOrInactive: number;
    activePercentage: number;
  };
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  accentBar,
  iconBg,
  iconColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  note: string;
  accentBar: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <article className="zd-panel relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all">
      {/* ── شريط لوني جانبي يعكس المعنى ── */}
      <div className={`absolute right-0 top-0 h-full w-1 rounded-r-2xl ${accentBar}`} />

      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-[18px] w-[18px] ${iconColor}`} />
        </div>
        <span className="font-manrope text-[22px] font-extrabold tracking-[-.06em] text-[var(--zd-text)]">
          {value}
        </span>
      </div>

      <div className="mt-4 text-[12px] font-semibold text-[var(--zd-text)]">
        {label}
      </div>
      <div className="mt-1 text-[10px] text-[var(--zd-muted)]">{note}</div>
    </article>
  );
}

export function DriverMetrics({ metrics }: DriverMetricsProps) {
  return (
    <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* ── الإجمالي — أزرق ── */}
      <MetricCard
        icon={UsersRound}
        label="إجمالي السائقين"
        value={metrics.total}
        note="سجلات محفوظة"
        accentBar="bg-[#5d8cff]"
        iconBg="bg-[#5d8cff]/10"
        iconColor="text-[#5d8cff]"
      />

      {/* ── النشطون — أخضر ── */}
      <MetricCard
        icon={Check}
        label="نشطون الآن"
        value={metrics.active}
        note={`${metrics.activePercentage}٪ من الفريق`}
        accentBar="bg-[#57d0bf]"
        iconBg="bg-[#57d0bf]/10"
        iconColor="text-[#57d0bf]"
      />

      {/* ── رخص تنتهي — برتقالي ── */}
      <MetricCard
        icon={CalendarClock}
        label="رخص تنتهي قريباً"
        value={metrics.expiringSoon}
        note="خلال ٦٠ يوماً"
        accentBar="bg-[#eab66b]"
        iconBg="bg-[#eab66b]/10"
        iconColor="text-[#eab66b]"
      />

      {/* ── إجازة / غير نشط — أحمر ── */}
      <MetricCard
        icon={Clock3}
        label="إجازة أو غير نشط"
        value={metrics.leaveOrInactive}
        note="تحتاج متابعة"
        accentBar="bg-[#ee6b76]"
        iconBg="bg-[#ee6b76]/10"
        iconColor="text-[#ee6b76]"
      />
    </section>
  );
}
