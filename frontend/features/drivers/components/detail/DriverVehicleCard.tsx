'use client';

import React from 'react';
import Link from 'next/link';
import { Car, ArrowUpRight, Unlink } from 'lucide-react';
import type { Driver } from '../../types/driver.types';

interface DriverVehicleCardProps {
  assignedVehicle?: Driver['assignedVehicle'];
  onAssignVehicleClick: () => void;
  onUnassignVehicleClick: () => void;
  isUnassigningVehicle: boolean;
}

export function DriverVehicleCard({
  assignedVehicle,
  onAssignVehicleClick,
  onUnassignVehicleClick,
  isUnassigningVehicle,
}: DriverVehicleCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">المركبة المسندة حالياً</h3>
            <p className="text-[10px] text-[var(--muted)]">الأصل التشغيلي تحت عهدة السائق</p>
          </div>
        </div>

        {assignedVehicle && (
          <div className="flex items-center gap-2">
            <Link
              href={`/vehicles/${assignedVehicle._id}`}
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              <span>تفاصيل المركبة</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={onUnassignVehicleClick}
              disabled={isUnassigningVehicle}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
              title="فك ارتباط المركبة"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {assignedVehicle ? (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-2)]/50 border border-[var(--border)]">
            <div>
              <span className="font-bold text-sm text-[var(--text)] block">
                {assignedVehicle.model} {assignedVehicle.year ? `(${assignedVehicle.year})` : ''}
              </span>
              <span className="text-[10px] text-[var(--muted)]">
                موديل وسنة الصنع
              </span>
            </div>

            {/* Plate */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[var(--surface)] border-2 border-[var(--border)] font-mono font-black text-sm shadow-xs tracking-widest" dir="ltr">
              <span className="text-[10px] text-[var(--muted)] font-sans border-r border-[var(--border)] pr-2 font-normal">KSA</span>
              <span className="text-[var(--text)]">{assignedVehicle.plateNumber}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-[var(--surface-2)]/30 border border-dashed border-[var(--border)] space-y-3">
          <Car className="w-10 h-10 text-[var(--muted)] mx-auto opacity-40" />
          <p className="text-xs text-[var(--muted)]">لا توجد مركبة معينة لهذا السائق حالياً</p>
          <button
            type="button"
            onClick={onAssignVehicleClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl hover:opacity-95 transition cursor-pointer"
          >
            <Car className="w-3.5 h-3.5" />
            <span>تعيين مركبة من الأسطول</span>
          </button>
        </div>
      )}
    </div>
  );
}
