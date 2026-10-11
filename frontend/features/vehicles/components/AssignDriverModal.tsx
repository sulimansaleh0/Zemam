'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCheck, Car, Loader2, Unlink, AlertTriangle, Info } from 'lucide-react';
import { assignDriverSchema, AssignDriverFormValues } from '../schemas/vehicle.schema';
import { VehicleWithRelations, BackendVehicle } from '../types/vehicle.types';
import { useAssignDriver, useUnassignDriver, useAvailableDrivers, useVehicles } from '../hooks/useVehicles';
import { getVehicleTeamId, getVehicleDriverId } from '../utils/vehicleHelpers';
import { Modal } from '@/shared/ui/Modal';
import type { BackendDriver } from '@/features/drivers';

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVehicle: BackendVehicle | VehicleWithRelations | null;
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
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const vehicleTeamId = getVehicleTeamId(targetVehicle?.teamId);
  const hasTeam = Boolean(vehicleTeamId);
  const targetDriverId = getVehicleDriverId(targetVehicle?.driverId);

  // السائقون المؤهلون:
  // 1. إذا كانت المركبة ضمن فريق: سائقو نفس الفريق + السائقون غير المقيدين بفريق
  // 2. إذا كانت المركبة في المستودع العام: السائقون غير المقيدين بفريق فقط
  const eligibleDrivers = availableDrivers.filter((d: BackendDriver) => {
    const dTeamId = getVehicleTeamId(d.teamId);
    if (vehicleTeamId) {
      return !dTeamId || String(dTeamId) === String(vehicleTeamId);
    }
    return !dTeamId;
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

  const handleClose = useCallback(() => {
    setAssignmentError(null);
    reset({
      driverId: targetDriverId || '',
    });
    onClose();
  }, [targetDriverId, reset, onClose]);

  const isPending = assignDriverMutation.isPending || unassignDriverMutation.isPending || isSubmitting;

  if (!targetVehicle) return null;

  const onSubmit = async (values: AssignDriverFormValues) => {
    if (isPending) return;
    setAssignmentError(null);
    try {
      await assignDriverMutation.mutateAsync({
        vehicleId: targetVehicle._id,
        driverId: values.driverId,
      });
      handleClose();
    } catch (error) {
      setAssignmentError(
        error instanceof Error ? error.message : 'تعذر تعيين السائق لهذه المركبة'
      );
    }
  };

  const handleUnassign = async () => {
    if (!targetDriverId || isPending) return;
    try {
      await unassignDriverMutation.mutateAsync(targetDriverId);
      handleClose();
    } catch {
      // Handled by toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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

          {targetDriverId && (
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

      {/* Info banner for vehicle status */}
      {!hasTeam ? (
        <div className="p-3.5 border-b border-blue-500/20 bg-blue-500/10 flex items-start gap-2.5 text-xs text-blue-700 dark:text-blue-400">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">المركبة في المستودع العام (غير مقيدة بفريق)</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400/80 mt-0.5">
              تظهر أدناه قائمة السائقين المتاحين في المخزون العام للتعيين المباشر.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 border-b border-emerald-500/20 bg-emerald-500/10 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p className="text-[11px]">
            المركبة تابعة لفريق تشغيلي: يمكنك اختيار سائق من نفس الفريق أو ضم سائق متاح من المخزون العام.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        {assignmentError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="font-medium leading-relaxed">{assignmentError}</p>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
            اختر السائق المؤهل <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              {...register('driverId')}
              disabled={isPending || isLoadingDrivers || eligibleDrivers.length === 0}
              className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer ${
                errors.driverId ? 'border-rose-500' : 'border-[var(--border)]'
              }`}
            >
              <option value="">-- اختر السائق من القائمة --</option>
              {eligibleDrivers.map((d: BackendDriver) => {
                const isCurrentDriver = targetDriverId === d._id;
                const dTeamId = getVehicleTeamId(d.teamId);
                const assignedVehicle = !isCurrentDriver
                  ? allVehicles.find((v) => getVehicleDriverId(v.driverId) === d._id)
                  : null;

                let tag = ' • (متاح)';
                if (isCurrentDriver) tag = ' ✓ (السائق الحالي)';
                else if (assignedVehicle) tag = ` ⚠️ (معين لـ ${assignedVehicle.model} - ${assignedVehicle.plateNumber})`;
                else if (vehicleTeamId && dTeamId && String(dTeamId) === String(vehicleTeamId)) tag = ' • (ضمن فريق المركبة)';
                else if (!dTeamId) tag = ' • (المخزون العام)';

                return (
                  <option key={d._id} value={d._id}>
                    {d.name && d.name !== 'Default' ? d.name : d.email.split('@')[0]} ({d.email}) {tag}
                  </option>
                );
              })}
            </select>
          </div>

          {eligibleDrivers.length === 0 && !isLoadingDrivers && (
            <p className="mt-2 text-xs text-[var(--muted)] p-2.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)]">
              لا يوجد سائقون متاحون مؤهلون لهذه المركبة حالياً. يمكنك إضافة سائقين من صفحة السائقين.
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
            onClick={handleClose}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending || eligibleDrivers.length === 0}
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
