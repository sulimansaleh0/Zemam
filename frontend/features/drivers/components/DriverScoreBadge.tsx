'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface DriverScoreBadgeProps {
  score?: number;
  showLabel?: boolean;
}

export function DriverScoreBadge({ score = 95, showLabel = true }: DriverScoreBadgeProps) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (s >= 75) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    if (s >= 60) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return 'سائق متميز';
    if (s >= 75) return 'سائق معتمد';
    return 'يحتاج متابعة';
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black font-mono border ${getScoreColor(
          score
        )}`}
      >
        <Star className="w-3 h-3 fill-current" />
        <span>{score}%</span>
      </span>
      {showLabel && (
        <span className="text-[10px] text-[var(--muted)] font-medium">
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
