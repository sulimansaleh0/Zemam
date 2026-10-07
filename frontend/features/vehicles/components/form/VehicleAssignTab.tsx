'use client';

import React from 'react';
import { Users, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import type { UseFormRegister } from 'react-hook-form';
import type { VehicleFormValues } from '../../schemas/vehicle.schema';
import type { BackendDriver } from '@/features/drivers';

interface TeamItem {
  _id: string;
  name: string;
}

interface VehicleAssignTabProps {
  register: UseFormRegister<VehicleFormValues>;
  isFleetManager: boolean;
  userTeamName: string;
  teamsList: TeamItem[];
  isLoadingTeams?: boolean;
  filteredDrivers: BackendDriver[];
  isLoadingDrivers?: boolean;
  selectedDriverObj?: BackendDriver;
  driverEligibility?: { eligible: boolean; reason?: string } | null;
  disabled?: boolean;
}

export function VehicleAssignTab({
  register,
  isFleetManager,
  userTeamName,
  teamsList,
  isLoadingTeams = false,
  filteredDrivers,
  isLoadingDrivers = false,
  selectedDriverObj,
  driverEligibility,
  disabled = false,
}: VehicleAssignTabProps) {
  return (
    <div className="space-y-4">
      {/* Assign Team */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
          الفريق التشغيلي {isFleetManager ? '(فريقك)' : '(اختياري)'}
        </label>
        <div className="relative">
          <Users className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {isFleetManager ? (
            <input
              type="text"
              readOnly
              value={userTeamName}
              className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] cursor-not-allowed opacity-90"
            />
          ) : (
            <select
              {...register('teamId')}
              disabled={disabled || isLoadingTeams}
              className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
            >
              <option value="">المستودع العام (بدون فريق حالياً)</option>
              {teamsList.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Assign Driver */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
          السائق المسؤول (اختياري مع فحص الأهلية)
        </label>
        <div className="relative">
          <UserCheck className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            {...register('driverId')}
            disabled={disabled || isLoadingDrivers}
            className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
          >
            <option value="">بدون سائق حالياً (تعيين لاحقاً)</option>
            {filteredDrivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name && d.name !== 'Default' ? d.name : d.email.split('@')[0]} ({d.email})
              </option>
            ))}
          </select>
        </div>

        {/* Driver Eligibility Alert */}
        {selectedDriverObj && driverEligibility && (
          <div
            className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
              driverEligibility.eligible
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {driverEligibility.eligible ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>السائق مؤهل رسمياً لقيادة هذه الفئة من المركبات.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{driverEligibility.reason || 'السائق غير مؤهل لقيادة هذا النوع من المركبات.'}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
