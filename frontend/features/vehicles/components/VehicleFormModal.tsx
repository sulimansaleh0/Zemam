'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Car, Calendar, Hash, UserCheck, Users, Loader2 } from 'lucide-react';
import { vehicleFormSchema, VehicleFormValues } from '../schemas/vehicle.schema';
import { useCreateVehicle, useAvailableDrivers, useAssignDriver } from '../hooks/useVehicles';
import { useTeams } from '@/features/teams';
import { useAuth } from '@/features/auth/context/AuthContext';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleFormModal({ isOpen, onClose }: VehicleFormModalProps) {
  const { user } = useAuth();
  const isFleetManager =
    user?.role === 'fleet_manager' || user?.role === 'fleet-manager';

  const { data: teamsList = [], isLoading: isLoadingTeams } = useTeams();
  const { drivers: availableDrivers = [], isLoading: isLoadingDrivers } = useAvailableDrivers();
  const createVehicleMutation = useCreateVehicle();
  const assignDriverMutation = useAssignDriver();

  const isSubmitting = createVehicleMutation.isPending || assignDriverMutation.isPending;

  const userTeamId =
    typeof user?.teamId === 'object' && user?.teamId !== null
      ? (user.teamId as any)._id
      : user?.teamId;

  const userTeamName =
    (typeof user?.teamId === 'object' && (user.teamId as any)?.name) ||
    teamsList.find((t) => t._id === userTeamId)?.name ||
    'فريقك التشغيلي';

  // If fleet manager, filter drivers to only their team
  const filteredDrivers = isFleetManager && userTeamId
    ? availableDrivers.filter((d) => {
        const dTeamId = typeof d.teamId === 'object' && d.teamId ? (d.teamId as any)._id : d.teamId;
        return String(dTeamId) === String(userTeamId);
      })
    : availableDrivers;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '' as unknown as number,
      teamId: isFleetManager && userTeamId ? userTeamId : '',
      driverId: '',
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        model: '',
        year: new Date().getFullYear(),
        plateNumber: '' as unknown as number,
        teamId: isFleetManager && userTeamId ? userTeamId : '',
        driverId: '',
      });
    }
  }, [isOpen, isFleetManager, userTeamId, reset]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const isSubmittingRef = React.useRef(false);

  const onSubmit = async (values: VehicleFormValues) => {
    if (isSubmittingRef.current || isSubmitting) return;
    isSubmittingRef.current = true;
    try {
      const assignedTeamId = isFleetManager && user?.teamId ? user.teamId : (values.teamId || undefined);
      const newVehicle = await createVehicleMutation.mutateAsync({
        model: values.model.trim(),
        year: Number(values.year),
        plateNumber: Number(values.plateNumber),
        teamId: assignedTeamId,
      });

      // إذا اختار المستخدم سائقاً أثناء إنشاء المركبة، نقوم بتعيينه فوراً
      if (values.driverId && newVehicle?._id) {
        await assignDriverMutation.mutateAsync({
          vehicleId: newVehicle._id,
          driverId: values.driverId,
        });
      }

      onClose();
    } catch {
      // Handled by mutation toast
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-2)]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 id="vehicle-modal-title" className="text-base font-bold text-[var(--text)]">
                إضافة مركبة جديدة للأسطول
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                أدخل بيانات المركبة لربطها بالأسطول وتعيين السائق
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="إغلاق النافذة"
            className="p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Model */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
              اسم وموديل المركبة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Car className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="مثال: تويوتا هايلوكس أو مرسيدس آكتروس"
                {...register('model')}
                disabled={isSubmitting}
                className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${
                  errors.model ? 'border-rose-500' : 'border-[var(--border)]'
                }`}
              />
            </div>
            {errors.model && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.model.message}
              </span>
            )}
          </div>

          {/* Year & Plate Number Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                سنة الصنع <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="2024"
                  {...register('year')}
                  disabled={isSubmitting}
                  className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${
                    errors.year ? 'border-rose-500' : 'border-[var(--border)]'
                  }`}
                />
              </div>
              {errors.year && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {errors.year.message}
                </span>
              )}
            </div>

            {/* Plate Number */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                رقم اللوحة (رقمي) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="1234"
                  dir="ltr"
                  {...register('plateNumber')}
                  disabled={isSubmitting}
                  className={`w-full pr-10 pl-3 py-2.5 rounded-xl border bg-[var(--surface)] text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all ${
                    errors.plateNumber ? 'border-rose-500' : 'border-[var(--border)]'
                  }`}
                />
              </div>
              {errors.plateNumber && (
                <span className="text-[11px] text-rose-500 mt-1 block">
                  {errors.plateNumber.message}
                </span>
              )}
            </div>
          </div>

          {/* Assign Team (Optional) */}
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
                  disabled={isSubmitting || isLoadingTeams}
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

          {/* Assign Driver (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
              السائق المسؤول (اختياري)
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-[var(--muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                {...register('driverId')}
                disabled={isSubmitting || isLoadingDrivers}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all cursor-pointer"
              >
                <option value="">بدون سائق حالياً (تعيين لاحقاً)</option>
                {filteredDrivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name !== 'Default' ? d.name : d.email.split('@')[0]} ({d.email})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-1">
              يمكنك تعيين أو تغيير السائق في أي وقت لاحقاً من جدول المركبات.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الحفظ...</span>
                </>
              ) : (
                <span>تسجيل المركبة</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
