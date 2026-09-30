'use client';

import { useMemo } from 'react';
import { Fuel } from 'lucide-react';
import { useFuel } from '@/features/fuel/hooks/useFuel';

export function TrendChart() {
  const { data: records = [], isLoading, isError } = useFuel();
  const points = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return { date, cost: 0 };
    });

    records.forEach((record) => {
      const recordDate = new Date(record.createdAt);
      recordDate.setHours(0, 0, 0, 0);
      const day = days.find(({ date }) => date.getTime() === recordDate.getTime());
      if (day) day.cost += record.cost;
    });

    return days;
  }, [records]);
  const maxCost = Math.max(...points.map(({ cost }) => cost), 0);
  const totalCost = points.reduce((total, point) => total + point.cost, 0);
  const chartPoints = points.map((point, index) => ({
    x: 42 + (index * 676) / (points.length - 1),
    y: 176 - (maxCost > 0 ? (point.cost / maxCost) * 142 : 0),
    ...point,
  }));
  const linePath = chartPoints.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const areaPath = `${linePath} L ${chartPoints.at(-1)?.x ?? 718} 184 L ${chartPoints[0].x} 184 Z`;

  return (
    <section className="zd-panel zd-rise zd-d2 rounded-2xl p-5 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold text-[var(--zd-text)]">تكاليف الوقود</h2>
          <p className="mt-1 text-[10px] text-[var(--zd-muted)]">آخر ٧ أيام · من سجلات الوقود الفعلية</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--zd-muted)]">
          <Fuel className="h-4 w-4 text-[var(--zd-blue)]" />
          <span>الإجمالي</span>
          <strong className="font-manrope text-[var(--zd-text)]">
            {totalCost.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ر.س
          </strong>
        </div>
      </div>

      {isError ? (
        <p className="mt-5 flex h-[190px] items-center justify-center text-xs text-rose-500">
          تعذر تحميل سجلات الوقود
        </p>
      ) : isLoading ? (
        <p className="mt-5 flex h-[190px] items-center justify-center text-xs text-[var(--zd-muted)]">
          جارٍ تحميل سجلات الوقود...
        </p>
      ) : totalCost === 0 ? (
        <p className="mt-5 flex h-[190px] items-center justify-center text-xs text-[var(--zd-muted)]">
          لا توجد تكلفة وقود مسجلة خلال الأيام السبعة الماضية
        </p>
      ) : (
        <div className="mt-5 h-[190px] w-full">
          <svg viewBox="0 0 760 220" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label="تكلفة الوقود اليومية خلال آخر سبعة أيام">
            <defs>
              <linearGradient id="fuelCostFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#5d8cff" stopOpacity=".25" />
                <stop offset="1" stopColor="#5d8cff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[34, 78, 122, 166].map((y) => (
              <line key={y} x1="35" y1={y} x2="730" y2={y} stroke="currentColor" className="text-[var(--zd-line)]" strokeWidth="1" />
            ))}
            <path d={areaPath} fill="url(#fuelCostFill)" />
            <path d={linePath} fill="none" stroke="#5d8cff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {chartPoints.map(({ x, y, cost, date }) => (
              <g key={date.toISOString()}>
                <circle cx={x} cy={y} r="4" fill="#5d8cff" stroke="var(--zd-surface)" strokeWidth="2" />
                <text x={x} y="211" textAnchor="middle" fill="currentColor" className="text-[var(--zd-muted)]" fontSize="10">
                  {date.toLocaleDateString('ar-EG', { weekday: 'short' })}
                </text>
                <title>{`${date.toLocaleDateString('ar-SA')}: ${cost.toLocaleString('ar-SA')} ر.س`}</title>
              </g>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}
