'use client';

import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  History,
} from 'lucide-react';
import type { Driver } from '../types/driver.types';

interface DriverScoreCardProps {
  driver: Driver;
}

export function DriverScoreCard({ driver }: DriverScoreCardProps) {
  // Default to 100 if score is not provided
  const score = driver.driverScore ?? 100;

  // Determine tier & styling
  let badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  let tierLabel = 'سائق ممتاز (فئة أولى)';
  let scoreColor = 'text-emerald-600 dark:text-emerald-400';
  let barColor = 'bg-emerald-500';

  if (score < 70) {
    badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    tierLabel = 'تحت المراقبة (مخاطر عالية)';
    scoreColor = 'text-rose-600 dark:text-rose-400';
    barColor = 'bg-rose-500';
  } else if (score < 80) {
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    tierLabel = 'أداء متوسط (يحتاج توجيه)';
    scoreColor = 'text-amber-600 dark:text-amber-400';
    barColor = 'bg-amber-500';
  } else if (score < 90) {
    badgeColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    tierLabel = 'أداء جيد جداً';
    scoreColor = 'text-blue-600 dark:text-blue-400';
    barColor = 'bg-blue-500';
  }

  // Audit history
  const auditHistory = driver.scoreHistory || [];

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">مؤشر تقييم وأداء السائق (Driver Score)</h3>
            <p className="text-[10px] text-[var(--muted)]">تقييم مبني على الالتزام بالمواعيد والصيانة وكفاءة الوقود</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
          {tierLabel}
        </div>
      </div>

      {/* Main Score Bar */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)]">
        <div className="text-center shrink-0">
          <div className={`text-3xl font-extrabold ${scoreColor} font-mono tracking-tight`}>
            {score}
            <span className="text-xs text-[var(--muted)] font-normal">/100</span>
          </div>
          <span className="text-[10px] text-[var(--muted)] block mt-0.5">الدرجة التراكمية</span>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text)] font-semibold">مستوى الكفاءة العامة</span>
            <span className="text-[var(--muted)] font-mono">{score}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown Badges */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--border)]">
          <div className="flex items-center justify-center gap-1 text-[var(--muted)] text-[10px] mb-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>الالتزام بالمواعيد</span>
          </div>
          <div className="font-bold text-[var(--text)]">
            {driver.delayedTasksCount ? `${driver.delayedTasksCount} تأخير` : 'ملتزم 100%'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--border)]">
          <div className="flex items-center justify-center gap-1 text-[var(--muted)] text-[10px] mb-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>مسؤولية الصيانة</span>
          </div>
          <div className="font-bold text-[var(--text)]">
            {driver.faultIncidentsCount ? `${driver.faultIncidentsCount} أعطال منسوبة` : 'خالٍ من الأعطال'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--surface-2)]/40 border border-[var(--border)]">
          <div className="flex items-center justify-center gap-1 text-[var(--muted)] text-[10px] mb-1">
            <Flame className="w-3 h-3 text-amber-500" />
            <span>كفاءة الوقود</span>
          </div>
          <div className="font-bold text-emerald-600 dark:text-emerald-400">
            اقتصادي
          </div>
        </div>
      </div>

      {/* Audit Log / Transparency List */}
      {auditHistory.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
            <History className="w-3.5 h-3.5" />
            <span>سجل أسباب تعديل التقييم (الشفافية):</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {auditHistory.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)] text-xs"
              >
                <div className="flex items-center gap-2">
                  {item.pointsChange < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span className="text-[var(--text)] text-[11px]">{item.reason}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[var(--muted)]">
                    {new Date(item.date).toLocaleDateString('ar-EG')}
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      item.pointsChange < 0 ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {item.pointsChange > 0 ? `+${item.pointsChange}` : item.pointsChange}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
