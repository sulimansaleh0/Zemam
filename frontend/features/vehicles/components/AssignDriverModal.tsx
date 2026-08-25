'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, UserCheck, Car, Loader2 } from 'lucide-react';
import { assignDriverSchema, AssignDriverFormValues } from '../schemas/vehicle.schema';
import { VehicleWithRelations } from '../types/vehicle.types';
import { useAssignDriver, useAvailableDrivers } from '../hooks/useVehicles';

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
  const assignDriverMutation = useAssignDriver();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignDriverFormValues>({
    resolver: zodResolver(assignDriverSchema),
    defaultValues: {
      driverId: '',
    },
  });

  useEffect(() => {
    if (isOpen && targetVehicle) {
      reset({
        driverId: targetVehicle.driverId || '',
      });
    }
  }, [isOpen, targetVehicle, reset]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !assignDriverMutation.isPending) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, assignDriverMutation.isPending, onClose]);

  if (!isOpen || !targetVehicle) return null;

  const onSubmit = async (values: AssignDriverFormValues) => {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-driver-modal-title"
    >
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-2)]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="assign-driver-modal-title" className="text-base font-bold text-[var(--text)]">
                تعيين سائق للمركبة
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                اختر السائق المسؤول عن قيادة المركبة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={assignDriverMutation.isPending}
            aria-label="إغلاق النافذة"
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Info Preview */}
        <div className="p-5 border-b border-[var(--border)] bg-[var(--surface-2)]/10">
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
              اختر السائق النشط <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                {...register('driverId')}
                disabled={assignDriverMutation.isPending || isLoadingDrivers}
                className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer ${
                  errors.driverId ? 'border-rose-500' : 'border-[var(--border)]'
                }`}
              >
                <option value="">-- اختر السائق من القائمة --</option>
                {availableDrivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name !== 'Default' ? d.name : d.email.split('@')[0]} ({d.email})
                  </option>
                ))}
              </select>
            </div>
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
              disabled={assignDriverMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={assignDriverMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {assignDriverMutation.isPending ? (
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
      </div>
    </div>
  );
}
