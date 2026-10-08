'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowUpRight, Unlink } from 'lucide-react';

interface DriverTeamCardProps {
  teamObj: { _id: string; name: string } | null;
  onAssignTeamClick: () => void;
  onRemoveTeamClick: () => void;
  isRemovingTeam: boolean;
}

export function DriverTeamCard({
  teamObj,
  onAssignTeamClick,
  onRemoveTeamClick,
  isRemovingTeam,
}: DriverTeamCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">الفريق التشغيلي والمسؤول</h3>
            <p className="text-[10px] text-[var(--muted)]">الهيكل الإداري المشرف على السائق</p>
          </div>
        </div>

        {teamObj && (
          <div className="flex items-center gap-2">
            <Link
              href={`/teams/${teamObj._id}`}
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              <span>فتح الفريق</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={onRemoveTeamClick}
              disabled={isRemovingTeam}
              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition cursor-pointer disabled:opacity-50"
              title="فك الارتباط عن الفريق"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {teamObj ? (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base text-[var(--text)]">
                فريق: {teamObj.name}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                فريق معتمد
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              جميع مهام هذا السائق وطلبات الوقود والصيانة تخضع لإشراف مدير هذا الفريق.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-[var(--surface-2)]/30 border border-dashed border-[var(--border)] space-y-3">
          <Users className="w-10 h-10 text-[var(--muted)] mx-auto opacity-40" />
          <p className="text-xs text-[var(--muted)]">السائق في المخزون العام وغير مقيد بفريق تشغيلي</p>
          <button
            type="button"
            onClick={onAssignTeamClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl hover:opacity-95 transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>تعيين لفريق تشغيلي</span>
          </button>
        </div>
      )}
    </div>
  );
}
