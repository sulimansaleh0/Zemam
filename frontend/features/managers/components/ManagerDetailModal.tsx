'use client';

import React from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Building2,
  Car,
  Users,
  CheckCircle2,
  Clock,
  Wrench,
  Fuel,
  Activity,
  ExternalLink,
  Shield,
  Mail,
  Phone,
} from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { useQuery } from '@tanstack/react-query';
import { teamService } from '@/features/teams/services/team.service';
import { useVehicles } from '@/features/vehicles';
import { useDriversList } from '@/features/drivers';
import type { FleetManager } from '../types/manager.types';

interface ManagerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: FleetManager | null;
}

export function ManagerDetailModal({
  isOpen,
  onClose,
  manager,
}: ManagerDetailModalProps) {
  const teamId =
    typeof manager?.teamId === 'object' && manager?.teamId !== null
      ? (manager?.teamId as any)._id
      : typeof manager?.teamId === 'string'
      ? manager?.teamId
      : null;

  const teamName =
    typeof manager?.teamId === 'object' && manager?.teamId !== null
      ? (manager?.teamId as any).name
      : null;

  // Fetch team stats if manager has a team
  const { data: teamStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['team-statics', teamId],
    queryFn: async () => {
      if (!teamId) return null;
      return await teamService.getTeamStatics(teamId);
    },
    enabled: Boolean(isOpen && teamId),
  });

  const { data: allVehicles = [] } = useVehicles();
  const { data: allDrivers = [] } = useDriversList();

  if (!manager) return null;

  const managerVehicles = allVehicles.filter((v) => {
    const vTeamId = typeof v.teamId === 'object' && v.teamId !== null ? v.teamId._id : v.teamId;
    return Boolean(vTeamId && teamId && String(vTeamId) === String(teamId));
  });

  const managerDrivers = allDrivers.filter((d) => {
    const dTeamId = typeof d.teamId === 'object' && d.teamId !== null ? d.teamId._id : d.teamId;
    return Boolean(dTeamId && teamId && String(dTeamId) === String(teamId));
  });

  const activeVehicles = managerVehicles.filter((v) => v.status === 'active').length;
  const inTaskVehicles = managerVehicles.filter((v) => v.isInTask).length;
  const activeDrivers = managerDrivers.filter((d) => d.status === 'active').length;

  const fuelCost = teamStats?.FuelRecordsCost?.reduce((acc, c) => acc + (c.totalCost || 0), 0) ?? 0;
  const maintenanceCost = teamStats?.maintenanceRecordsCost?.reduce((acc, c) => acc + (c.totalCost || 0), 0) ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ملف وإحصائيات مدير الأسطول"
      description={`عرض أداء المدير: ${manager.name || manager.email}`}
      icon={UserCheck}
      iconClassName="bg-[var(--primary-light)] text-[var(--primary)]"
      maxWidth="max-w-[650px]"
    >
      <div className="p-6 space-y-5 text-xs">
        {/* Basic Info Box */}
        <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">{manager.name || 'مدير أسطول'}</h3>
              <div className="flex items-center gap-2 text-[var(--muted)] mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span className="font-mono" dir="ltr">{manager.email}</span>
                {manager.phone && (
                  <>
                    <span>•</span>
                    <Phone className="w-3.5 h-3.5" />
                    <span dir="ltr">{manager.phone}</span>
                  </>
                )}
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                manager.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {manager.status === 'active' ? 'حساب نشط' : 'حساب معطل'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span className="text-[var(--muted)]">الفريق التشغيلي:</span>
              <span className="font-bold text-[var(--text)]">{teamName || 'غير مسند لفريق حالياً'}</span>
            </div>

            {teamId && (
              <Link
                href={`/teams/${teamId}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline font-semibold"
              >
                <span>فتح صفحة الفريق</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Team Resources Stats */}
        <div className="space-y-2">
          <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5 text-sm">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>موارد الفريق المدارة</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center shadow-xs">
              <Car className="w-4 h-4 mx-auto text-blue-500 mb-1" />
              <div className="text-lg font-bold text-[var(--text)]">{managerVehicles.length}</div>
              <div className="text-[10px] text-[var(--muted)]">إجمالي المركبات</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center shadow-xs">
              <Activity className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{activeVehicles}</div>
              <div className="text-[10px] text-[var(--muted)]">مركبات نشطة</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center shadow-xs">
              <Clock className="w-4 h-4 mx-auto text-amber-500 mb-1" />
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{inTaskVehicles}</div>
              <div className="text-[10px] text-[var(--muted)]">في مهام حالية</div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center shadow-xs">
              <Users className="w-4 h-4 mx-auto text-purple-500 mb-1" />
              <div className="text-lg font-bold text-[var(--text)]">{managerDrivers.length}</div>
              <div className="text-[10px] text-[var(--muted)]">سائقو الفريق ({activeDrivers} نشط)</div>
            </div>
          </div>
        </div>

        {/* Operational Tasks and Expenses Stats */}
        <div className="space-y-2">
          <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5 text-sm">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>الأداء التشغيلي والمصروفات</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)] text-[11px]">المهام المنفذة</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-[var(--text)]">
                {teamStats?.finishedTasks ?? 0}
                <span className="text-[10px] text-[var(--muted)] font-normal mr-1">
                  / {teamStats?.totalTasks ?? 0}
                </span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {teamStats?.totalTasks
                  ? `${Math.round(((teamStats.finishedTasks || 0) / teamStats.totalTasks) * 100)}% إتمام`
                  : 'لا توجد مهام'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)] text-[11px]">مصروفات الوقود</span>
                <Fuel className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-lg font-bold text-[var(--text)] font-mono">
                {fuelCost.toLocaleString('ar-SA')} ر.س
              </div>
              <div className="text-[10px] text-[var(--muted)]">
                {teamStats?.approvedFuelRecords ?? 0} فاتورة معتمدة
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)] text-[11px]">تكاليف الصيانة</span>
                <Wrench className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-lg font-bold text-[var(--text)] font-mono">
                {maintenanceCost.toLocaleString('ar-SA')} ر.س
              </div>
              <div className="text-[10px] text-[var(--muted)]">
                {teamStats?.approvedMaintenanceRecords ?? 0} صيانة معتمدة
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </Modal>
  );
}
