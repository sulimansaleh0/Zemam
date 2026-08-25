'use client';

import { Users, UserCheck, UserX, Activity } from 'lucide-react';

interface DriverMetricsData {
  total: number;
  active: number;
  inactive: number;
  activePercentage: number;
}

interface DriverMetricsProps {
  metrics: DriverMetricsData;
}

interface MetricCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export function DriverMetrics({ metrics }: DriverMetricsProps) {
  const cards: MetricCard[] = [
    {
      label: 'إجمالي السائقين',
      value: metrics.total,
      icon: Users,
      color: 'text-[var(--zd-blue)]',
      bg: 'bg-[var(--zd-blue)]/10',
    },
    {
      label: 'السائقون النشطون',
      value: metrics.active,
      icon: UserCheck,
      color: 'text-[var(--zd-teal)]',
      bg: 'bg-[var(--zd-teal)]/10',
    },
    {
      label: 'غير النشطين',
      value: metrics.inactive,
      icon: UserX,
      color: 'text-[var(--zd-red)]',
      bg: 'bg-[var(--zd-red)]/10',
    },
    {
      label: 'نسبة النشاط',
      value: `${metrics.activePercentage}%`,
      icon: Activity,
      color: 'text-[var(--zd-amber)]',
      bg: 'bg-[var(--zd-amber)]/10',
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="zd-panel zd-rise rounded-2xl p-4 transition-colors"
          >
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}>
              <Icon className={`h-4.5 w-4.5 ${card.color}`} />
            </div>
            <div className="font-manrope text-[22px] font-bold text-[var(--zd-text)]">
              {card.value}
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--zd-muted)]">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}
