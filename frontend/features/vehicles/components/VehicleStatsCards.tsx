'use client';

import React from 'react';
import { Truck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { FleetOverviewStats, VehicleWithRelations } from '../types/vehicle.types';
import { useFleetOverviewStats } from '../hooks/useVehicles';

interface VehicleStatsCardsProps {
  vehicles?: VehicleWithRelations[];
  overviewStats?: FleetOverviewStats | null;
}

export function VehicleStatsCards({ overviewStats: propStats }: VehicleStatsCardsProps) {
  const { data: fetchedStats, isLoading } = useFleetOverviewStats();
  const serverStats = propStats ?? fetchedStats;

  // Render skeleton placeholder while loading server authoritative stats
  if (isLoading || !serverStats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs flex items-center justify-between animate-pulse"
          >
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-[var(--surface-2)] rounded-md" />
              <div className="h-7 w-12 bg-[var(--surface-2)] rounded-md" />
              <div className="h-2.5 w-24 bg-[var(--surface-2)] rounded-md" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // Use authoritative MongoDB aggregated numbers directly from the server
  const total = serverStats.total ?? 0;
  const active = serverStats.active ?? 0;
  const inTask = serverStats.inTask ?? 0;
  const inactive = serverStats.inactive ?? 0;

  const stats = [
    {
      title: 'إجمالي المركبات',
      value: total,
      label: 'مركبة مسجلة بالأسطول',
      icon: Truck,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    },
    {
      title: 'مركبات نشطة',
      value: active,
      label: 'جاهزة للتشغيل',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    },
    {
      title: 'في مهام حالياً',
      value: inTask,
      label: 'قيد التوصيل والعمليات',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    },
    {
      title: 'غير نشطة',
      value: inactive,
      label: 'متوقفة عن العمل',
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">{stat.title}</span>
              <div className="text-2xl font-black text-[var(--text)] font-manrope">
                {stat.value}
              </div>
              <span className="text-[11px] text-[var(--muted)] block">{stat.label}</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
