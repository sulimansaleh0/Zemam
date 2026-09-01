'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, Calendar, Hash, UserCheck, Users, Loader2 } from 'lucide-react';
import { vehicleFormSchema, VehicleFormValues } from '../schemas/vehicle.schema';
import { useCreateVehicle, useAvailableDrivers, useAssignDriver } from '../hooks/useVehicles';
import { useTeams } from '@/features/teams';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getVehicleTeamId, getVehicleTeamName } from '../utils/vehicleHelpers';
import { Modal } from '@/shared/ui/Modal';

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

  const userTeamId = getVehicleTeamId(user?.teamId);
  const userTeamName =
    getVehicleTeamName(user?.teamId, teamsList) || 'فريقك التشغيلي';

  // If fleet manager, filter drivers to only their team
  const filteredDrivers = isFleetManager && userTeamId
    ? availableDrivers.filter((d) => {
        const dTeamId = getVehicleTeamId(d.teamId);
        return String(dTeamId) === String(userTeamId);
      })
    : availableDrivers;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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

  const isPending = createVehicleMutation.isPending || assignDriverMutation.isPending || isSubmitting;

  const onSubmit = async (values: VehicleFormValues) => {
    if (isPending) return;
    try {
      const assignedTeamId = isFleetManager && userTeamId ? userTeamId : (values.teamId || undefined);
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
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة مركبة جديدة للأسطول"
      description="أدخل بيانات المركبة لربطها بالأسطول وتعيين السائق"
      icon={Car}
      iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
      maxWidth="lg"
      preventClose={isPending}
      aria-labelledby="vehicle-modal-title"
    >
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
              disabled={isPending}
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
                disabled={isPending}
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
                disabled={isPending}
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
                disabled={isPending || isLoadingTeams}
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
              disabled={isPending || isLoadingDrivers}
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
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
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
    </Modal>
  );
}
