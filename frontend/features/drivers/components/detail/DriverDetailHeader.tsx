'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Car,
  Users,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import type { Driver } from '../../types/driver.types';
import { DriverAvatar } from '../DriverAvatar';
import { StatusPill } from '../StatusPill';
import { formatRelativeDate } from '../../utils/driverHelpers';

interface DriverDetailHeaderProps {
  driver: Driver;
  displayName: string;
  isActive: boolean;
  teamObj: { _id: string; name: string } | null;
  scoreTier: {
    label: string;
    color: string;
    bg: string;
    border: string;
  };
  isChangingStatus: boolean;
  isDeleting: boolean;
  onAssignVehicleClick: () => void;
  onAssignTeamClick: () => void;
  onToggleStatusClick: () => void;
  onDeleteClick: () => void;
}

export function DriverDetailHeader({
  driver,
  displayName,
  isActive,
  teamObj,
  scoreTier,
  isChangingStatus,
  isDeleting,
  onAssignVehicleClick,
  onAssignTeamClick,
  onToggleStatusClick,
  onDeleteClick,
}: DriverDetailHeaderProps) {
  return (
    <div className="space-y-4">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
        <Link
          href="/drivers"
          className="hover:text-[var(--primary)] transition-colors flex items-center gap-1"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span>إدارة السائقين</span>
        </Link>
        <span>/</span>
        <span className="text-[var(--primary)]">{displayName}</span>
      </div>

      {/* ── Executive Profile Hero ── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Driver Info */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <DriverAvatar driver={driver} size="lg" />
              <span
                className={`absolute bottom-0 left-0 w-4 h-4 rounded-full border-2 border-[var(--surface)] ${
                  isActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={isActive ? 'حساب نشط' : 'حساب معطل'}
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  {displayName}
                </h1>
                <StatusPill status={driver.status} />
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${scoreTier.bg} ${scoreTier.color} border ${scoreTier.border}`}
                >
                  <Award className="w-3 h-3" />
                  {scoreTier.label}
                </span>
              </div>

              {/* Email and Phone */}
              <div className="flex items-center gap-4 text-xs text-[var(--muted)] flex-wrap">
                <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  {driver.email}
                </span>
                {driver.phone && (
                  <span className="flex items-center gap-1.5 font-mono" dir="ltr">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    {driver.phone}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  انضم {formatRelativeDate(driver.createdAt)}
                </span>
              </div>

              {/* Team & Vehicle Badges */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {teamObj ? (
                  <Link
                    href={`/teams/${teamObj._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-colors border border-indigo-500/20"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>فريق: {teamObj.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] text-xs font-medium border border-[var(--border)]">
                    المخزون العام (بدون فريق)
                  </span>
                )}

                {driver.assignedVehicle ? (
                  <Link
                    href={`/vehicles/${driver.assignedVehicle._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>
                      {driver.assignedVehicle.model} ({driver.assignedVehicle.plateNumber})
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-60" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] text-xs font-medium border border-[var(--border)]">
                    بدون مركبة معينة
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions Toolbar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 w-full lg:w-auto">
            <button
              type="button"
              onClick={onAssignVehicleClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
            >
              <Car className="w-3.5 h-3.5" />
              <span>{driver.assignedVehicle ? 'تغيير المركبة' : 'تعيين مركبة'}</span>
            </button>

            <button
              type="button"
              onClick={onAssignTeamClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)] transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{teamObj ? 'تغيير الفريق' : 'إسناد لفريق'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleStatusClick}
              disabled={isChangingStatus}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                isActive
                  ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                  : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              {isActive ? (
                <UserX className="w-3.5 h-3.5" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              <span>{isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}</span>
            </button>

            <button
              type="button"
              onClick={onDeleteClick}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              title="حذف السائق"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
