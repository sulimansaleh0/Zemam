'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCheck, Car, Loader2, Unlink, AlertTriangle } from 'lucide-react';
import { assignDriverSchema, AssignDriverFormValues } from '../schemas/vehicle.schema';
import { VehicleWithRelations } from '../types/vehicle.types';
import { useAssignDriver, useUnassignDriver, useAvailableDrivers, useVehicles } from '../hooks/useVehicles';
import { getVehicleTeamId, getVehicleDriverId } from '../utils/vehicleHelpers';
import { Modal } from '@/shared/ui/Modal';

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVehicle: VehicleWithRelations | null;
}

export function AssignDriverModal({
  isOpen,
  onClose,
  targetVehicle,
}: AssignDriverModalProps) {
  const { drivers: availableDrivers, isLoading: isLoadingDrivers } = useAvailableDrivers();
  const { data: allVehicles = [] } = useVehicles();
  const assignDriverMutation = useAssignDriver();
  const unassignDriverMutation = useUnassignDriver();

  const vehicleTeamId = getVehicleTeamId(targetVehicle?.teamId);
  const hasTeam = Boolean(vehicleTeamId);
  const targetDriverId = getVehicleDriverId(targetVehicle?.driverId);

  // تصفية السائقين التابعين لنفس فريق المركبة فقط
  const teamDrivers = availableDrivers.filter((d) => {
    const dTeamId = getVehicleTeamId(d.teamId);
    return Boolean(dTeamId && vehicleTeamId && String(dTeamId) === String(vehicleTeamId));
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignDriverFormValues>({
    resolver: zodResolver(assignDriverSchema),
    defaultValues: {
      driverId: '',
    },
  });

  useEffect(() => {
    if (isOpen && targetVehicle) {
      reset({
        driverId: targetDriverId || '',
      });
    }
  }, [isOpen, targetVehicle, targetDriverId, reset]);

  const isPending = assignDriverMutation.isPending || unassignDriverMutation.isPending || isSubmitting;

  if (!targetVehicle) return null;

  const onSubmit = async (values: AssignDriverFormValues) => {
    if (!hasTeam || isPending) return;
    try {
      await assignDriverMutation.mutateAsync({
        vehicleId: targetVehicle._id,
        driverId: values.driverId,
      });
      onClose();
    } catch {
      // Handled by toast
    }
  };

  const handleUnassign = async () => {
    if (!targetDriverId || isPending) return;
    try {
      await unassignDriverMutation.mutateAsync(targetDriverId);
      onClose();
    } catch {
      // Handled by toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تعيين سائق للمركبة"
      description="اختر السائق المسؤول عن قيادة المركبة"
      icon={UserCheck}
      iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      maxWidth="md"
      preventClose={isPending}
      aria-labelledby="assign-driver-modal-title"
    >
      {/* Vehicle Info Preview */}
      <div className="p-5 border-b border-[var(--border)] bg-[var(--surface-2)]/10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--surface-2)] flex items-center justify-center text-[var(--primary)] shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--text)]">{targetVehicle.model}</div>
              <div className="text-[11px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                <span>سنة الصنع: {targetVehicle.year}</span>
                <span>•</span>
                <span>لوحة رقم: <strong className="font-mono text-[var(--text)]">{targetVehicle.plateNumber}</strong></span>
              </div>
            </div>
          </div>

          {targetVehicle.driverId && (
            <button
              type="button"
              onClick={handleUnassign}
              disabled={isPending}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer"
              title="فك ارتباط السائق الحالي"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>فك الارتباط</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning if vehicle has no team */}
      {!hasTeam && (
        <div className="p-4 border-b border-amber-500/20 bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">المركبة غير منضمة لأي فريق تشغيلي حالياً</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-0.5">
              حسب قواعد النظام، يجب إسناد المركبة لفريق تشغيلي أولاً لربط سائق من نفس الفريق بها.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            اختر السائق من فريق المركبة <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              {...register('driverId')}
              disabled={isPending || isLoadingDrivers || !hasTeam}
              className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer ${
                errors.driverId ? 'border-rose-500' : 'border-[var(--border)]'
              }`}
            >
              <option value="">-- اختر السائق من القائمة --</option>
              {teamDrivers.map((d) => {
                const isCurrentDriver = targetVehicle.driverId === d._id;
                const assignedVehicle = !isCurrentDriver
                  ? allVehicles.find((v) => v.driverId === d._id)
                  : null;
                return (
                  <option key={d._id} value={d._id}>
                    {d.name !== 'Default' ? d.name : d.email.split('@')[0]} ({d.email})
                    {isCurrentDriver
                      ? ' ✓ (السائق الحالي)'
                      : assignedVehicle
                      ? ` ⚠️ (معين لـ ${assignedVehicle.model} - ${assignedVehicle.plateNumber})`
                      : ' • (متاح)'}
                  </option>
                );
              })}
            </select>
          </div>

          {hasTeam && teamDrivers.length === 0 && !isLoadingDrivers && (
            <p className="mt-2 text-xs text-[var(--muted)] p-2.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)]">
              لا يوجد سائقون مسجلون في فريق هذه المركبة حالياً. يمكنك إضافة سائق للفريق من صفحة السائقين.
            </p>
          )}

          {errors.driverId && (
            <span className="text-[11px] text-rose-500 mt-1 block">
              {errors.driverId.message}
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending || !hasTeam}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جارٍ الحفظ...</span>
              </>
            ) : (
              <span>تأكيد التعيين</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
